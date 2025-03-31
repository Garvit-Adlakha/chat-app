import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import { catchAsync } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    throw new AppError("Authentication required. Please login.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User no longer exists.", 401);
    }

    req.id = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid authentication token.", 401);
    }
    if (error.name === "TokenExpiredError") {
      throw new AppError("Your session has expired. Please login again.", 401);
    }
    throw error;
  }
});

export const socketAuthenticator = async (err, socket, next) => {
  if (err) {
    return next(new Error("Error parsing cookies"));
  }
  
  try {
    const authToken = socket.request.cookies.token;
    
    if (!authToken) {
      return next(new Error("Authentication required"));
    }
    
    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.userId);
    
    if (!user) {
      return next(new Error("User not found"));
    }
    
    // Attach user to socket
    socket.user = user;
    socket.userId = user._id;
    
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    return next(new Error("Authentication error"));
  }
};