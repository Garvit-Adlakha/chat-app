import express from 'express';
import cookieParser from 'cookie-parser';
import {createServer} from 'http';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './database/db.js';

dotenv.config();

await connectDB();
const app = express();
const Port=process.env.PORT || 5000;
const server=createServer(app);


//rateLimier
const limiter=rateLimit(
    {
        windowMs:15*60*1000,
        max:100,
        message:'Too many request from this IP, please try again after 15 minutes'
    }
)

//middleware
app.use(helmet())
app.use(hpp())
app.use("/api",limiter)
app.use(express.json({
    limit:'10kb'
}))
app.use(express.urlencoded({
    extended:true,
    limit:'10kb'
}))
app.use(cookieParser())

//logging
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//cors config
app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD"],
    allowedHeaders:["Content-Type","Authorization"]
}))

//api routes
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/chat', chatRoutes)


//sockets routes


//404 routes handler
app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:'Route not found'
    })
})

// Global Error handler
import { errorHandler } from './middlewares/error.middleware.js';

app.use(errorHandler)
//server
server.listen(Port, () => {
    console.log(`Server running on port ${Port} in ${process.env.NODE_ENV} mode`)
  })