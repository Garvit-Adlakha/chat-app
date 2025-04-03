import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import { catchAsync } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const isAuthenticated = catchAsync(async (req, res, next) => {
  try {
    // Focus primarily on the cookie for web applications
    const token = req.cookies?.token;
    
    if (!token) {
      return next(new AppError("Authentication required. Please log in to access this resource.", 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "JsonWebTokenError") {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
      if (jwtError.name === "TokenExpiredError") {
        return next(new AppError("Your session has expired. Please log in again.", 401));
      }
      throw jwtError;
    }
    
    // Set user ID in request
    req.id = decoded.userId;
    
    // Get user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new AppError("The user associated with this token no longer exists.", 401));
    }

    // Update last active status without awaiting
    User.findByIdAndUpdate(user._id, { lastActive: Date.now() }).catch(err => 
      console.error("Failed to update last active:", err)
    );

    // Attach the user object to the request for convenience
    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
});

export const socketAuthenticator = async (err, socket, next) => {
  if (err) {
    console.error("Cookie parsing error:", err);
    return next(new Error("Error parsing cookies"));
  }
  
  try {
    // Focus on cookies for socket authentication as well
    let token = null;
    
    // Try to get token from cookies
    if (socket.request.cookies && socket.request.cookies.token) {
      token = socket.request.cookies.token;
    }
    
    if (!token) {
      console.error("No token found in socket request");
      return next(new Error("Authentication required"));
    }
    
    try {
      const decodedData = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decodedData.userId) {
        return next(new Error("Invalid authentication token"));
      }
      
      const user = await User.findById(decodedData.userId);
      
      if (!user) {
        return next(new Error("User not found"));
      }
      
      // Attach user to socket
      socket.user = user;
      socket.userId = user._id;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return next(new Error("Invalid or expired token"));
    }
  } catch (error) {
    console.error("Socket authentication error:", error.message, error.stack);
    return next(new Error("Authentication error"));
  }
};