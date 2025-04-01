import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Server } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { socketAuthenticator } from './middlewares/auth.middleware.js';
import validateEnvironmentVariables from './utils/validateEnv.js';

// Validate environment variables before doing anything else
validateEnvironmentVariables();

dotenv.config();
await connectDB();
const Port = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        // Allow both specific origins and handle null origin (for file:// protocol)
        origin: function(origin, callback) {
            const allowedOrigins = [
                "http://localhost:3000",
                "http://localhost:4173",
                process.env.CLIENT_URL
            ].filter(Boolean);
            
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log("Blocked origin:", origin);
                callback(null, false);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000, // Increase ping timeout to 60 seconds
    pingInterval: 25000, // Ping every 25 seconds
    cookie: {
        name: 'token',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
    },
});

//rateLimier
const limiter = rateLimit(
    {
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: 'Too many request from this IP, please try again after 15 minutes'
    }
)

//middleware

app.set('io', io)
app.use(helmet())
app.use(hpp())
app.use("/api", limiter)
app.use(express.json({
    limit: '10kb'
}))
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))
app.use(cookieParser())

// Fix for CORB issues with external images
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

//logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//cors config
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4173", 
      process.env.CLIENT_URL // Make sure this is correctly set in your .env
    ].filter(Boolean);
    
    // For development/debugging, you can allow all origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked origin:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization","Accept"],
};


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
  });

app.use(cors(corsOptions));

//api routes
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import { TYPING, USER_STATUS_CHANGE } from './constants.js';
import { getSockets } from './utils/sockets.js';
import { Message } from './models/message.model.js';
import { User } from './models/user.model.js';
import { Chat } from './models/chat.model.js';
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/chat', chatRoutes)



export const userSocketIds = new Map();

// Fix the Socket.IO middleware setup
io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res || {},
        (err) => socketAuthenticator(err, socket, next)
    );
});

//sockets routes
io.engine.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", {
        code: err.code,
        message: err.message,
        context: err.context || 'No context available'
    });
});

io.on('connection', async(socket) => {
    const user = socket.user;

    await User.findByIdAndUpdate(user._id, {
        $set: {
            isOnline: true,
            lastActive: Date.now()
        }
    }, {
        new: true,
        runValidators: true
    })

   const userChats=await Chat.find({
        members:user._id
   }).select('members')

   const friendIds = [...new Set(
    userChats.flatMap(chat => 
        chat.members
        .filter(id => id.toString() !== user._id.toString())
    )
)];

    const friendSockets=getSockets(friendIds)

    io.to(friendSockets).emit(USER_STATUS_CHANGE,{
        userId:user._id,
        isOnline:true
    })
   
    userSocketIds.set(user._id.toString(), socket.id)
    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        }
        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId
        }

        const membersSocket = getSockets(members)
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        })
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
            chatId,
        })
        try {
            await Message.create(messageForDB)
        } catch (error) {
            console.log(error)
        }
    })

    socket.on(TYPING, ({ members, chatId }) => {
        const membersSocket = getSockets(members)
        socket.to(membersSocket).emit(TYPING, {
            chatId,
            user: {
                _id: user._id,
                name: user.name
            }
        });
    });

    socket.on(STOP_TYPING, ({ members, chatId }) => {
        const membersSocket = getSockets(members)
        socket.to(membersSocket).emit(STOP_TYPING, {
            chatId,
            user: {
                _id: user._id,
                name: user.name
            }
        });
    });

    socket.on('error', (error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Socket error:', error);
        }
    });

    socket.on('disconnect', async(reason) => {
        await User.findByIdAndUpdate(user._id, {
            $set: {
                isOnline: false,
                lastActive: Date.now()
            }
        }, {
            new: true,
            runValidators: true
        })

        userSocketIds.delete(user._id.toString())

        io.to(friendSockets).emit(USER_STATUS_CHANGE, {
            userId: user._id,
            isOnline: false,
            lastActive: new Date()
        })
    });
});

//404 routes handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})


// Global Error handler
import { errorHandler } from './middlewares/error.middleware.js';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, STOP_TYPING } from './constants.js';


app.use(errorHandler)
//server
server.listen(Port, () => {
    console.log(`Server running on port ${Port} in ${process.env.NODE_ENV} mode`);
    console.log(`Socket.IO server ready for connections`);
}).on('error', (err) => {
    console.error('Server startup error:', err);
    process.exit(1);
});