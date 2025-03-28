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
import {v4 as uuid} from 'uuid';
import { socketAuthenticator } from './middlewares/auth.middleware.js';

dotenv.config();
await connectDB();
const Port = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
        allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling'],
    secure: process.env.NODE_ENV === 'production',
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

//logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//cors config
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));



//api routes
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
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
    console.log("Socket.IO connection error:", err.code, err.message);
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    const user = socket.user;
    console.log('User:', user);
    userSocketIds.set(user._id.toString(),socket.id)
    socket.on(NEW_MESSAGE,async({chatId,members,message})=>{
        const messageForRealTime={
            content:message,
            _id:uuid(),
            sender:{
                _id:user._id,
                name:user.name,
            },
            chat:chatId,
            createdAt:new Date().toISOString()
        }
        const messageForDB={
            content:message,
            sender:user._id,
            chat:chatId
        }

        const membersSocket=getSockets(members)
        io.to(membersSocket).emit(NEW_MESSAGE,{
            chatId,
            message:messageForRealTime
        })
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT,{
            chatId,
        })
        try {
            await Message.create(messageForDB)
        } catch (error) {
            console.log(error)
            
        }
    })

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
        userSocketIds.delete(user._id.toString())
        console.log('Client disconnected:', socket.id, 'Reason:', reason);
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
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from './constants.js';
import { getSockets } from './utils/sockets.js';
import { Message } from './models/message.model.js';
import { createGroupChats, createSingleChats } from './seeders/Chat.js';

app.use(errorHandler)
//server
server.listen(Port, () => {
    console.log(`Server running on port ${Port} in ${process.env.NODE_ENV} mode`)
})