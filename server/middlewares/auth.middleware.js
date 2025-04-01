import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import { catchAsync } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new AppError("You are not logged in. Please log in to get access.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.id = decoded.userId;
    req.user = await User.findById(req.id);

    if (!req.user) {
      throw new AppError("User not found", 404);
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid token. Please log in again.", 401);
    }
    if (error.name === "TokenExpiredError") {
      throw new AppError("Your token has expired. Please log in again.", 401);
    }
    throw error;
  }
});

export const socketAuthenticator = async (err, socket, next) => {
  if (err) {
    console.error("Cookie parsing error:", err);
    return next(new Error("Error parsing cookies"));
  }
  
  try {
    let token = null;
    
    // Try to get token from cookies
    if (socket.request.cookies && socket.request.cookies.token) {
      token = socket.request.cookies.token;
    }
    // Fallback to auth header
    else if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    else if (socket.handshake.headers.authorization) {
      token = socket.handshake.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.error("No token found in socket request");
      return next(new Error("Authentication required"));
    }
    
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
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    return next(new Error("Authentication error"));
  }
};