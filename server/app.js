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

dotenv.config();
await connectDB();
const Port = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const corsOptions = {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD", "CONNECT", "TRACE"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  

const io = new Server(server, {
    cors: corsOptions, // Use the same CORS options
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    // Remove the cookie configuration as we're using HTTP-only cookies
});

//rateLimit configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Reduced from 10000 to 1000 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count successful requests too
    keyGenerator: (req) => req.ip // Use IP for rate limiting
});

// Enhanced cookie parser options with security config
app.use(cookieParser());

// Middleware with improved security configuration
app.set('io', io);

// Configure Helmet with strict security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:", "https:"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(hpp({
    whitelist: [] // Specify parameters that are allowed to be duplicated
}));

// Apply rate limiting to all API routes
app.use("/api", limiter);

// Request body parsing with consistent limits and sanitization
const payloadLimit = '5mb'; // Reduced from 10kb for file uploads
app.use(express.json({
    limit: payloadLimit,
    verify: (req, res, buf) => { req.rawBody = buf }, // Store raw body for webhook verification
}));

app.use(express.urlencoded({
    extended: true,
    limit: payloadLimit,
}));

// Fix for CORB issues with external images
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

//logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Improved CORS configuration with explicit support for production domains


// Apply CORS early in the middleware chain
app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
app.options("*", cors(corsOptions));

//api routes
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import uploadRoutes from './routes/uploadRoutes.js'; // Add this import

import { TYPING, USER_STATUS_CHANGE } from './constants.js';
import { getSockets } from './utils/sockets.js';
import { Message } from './models/message.model.js';
import { User } from './models/user.model.js';
import { Chat } from './models/chat.model.js';
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1/upload', uploadRoutes) // Add this line to register the new routes



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