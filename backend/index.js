import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import hpp from 'hpp'
import rateLimit from 'express-rate-limit'
import connectDB from './database/db.js'
import userRoute from './routes/user.route.js'
import projectRoute from './routes/project.route.js'

dotenv.config();
await connectDB()
const app=express()
const PORT=process.env.PORT || 4000

const limiter =rateLimit(
    {
        windowMs:15*60*1000, //15 min
        max:100,
        message:"Too many requests from this IP, please try again later"
    }
)

app.use(helmet()) //set security HTTP headers
app.use(hpp())
app.use("/api",limiter)

//for logging
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}

//body parser Middleware
app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))
app.use(cookieParser())

//cors config
app.use(
    cors({
        origin:process.env.CLIENT_URL, // add or url later
        credentials:true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
        allowedHeaders:[
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "device-remember-token",
            "Access-Control-Allow-Origin",
            "Origin",
            "Accept",
        ]
    })
)


//API routes
app.use('/api/v1/user',userRoute)



//404 handler
app.use((req,res)=>{
    res.status(404).json({
        status:"error",
        message:"Route not found"
    })
})

// Global Error Handler.
app.use((err, req, res, next) => {
    console.error(err);

    // ✅ Prevent "Cannot set headers after they are sent" error
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        status: "error",
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

  
  // Start server
  app.listen(PORT, () => {
    console.log(
      ` Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
    );
  });
  