import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import { catchAsync } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

// HTTP Request Authentication Middleware
export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new AppError("You are not logged in. Please log in to get access.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.userId;
    req.user = await User.findById(req.id).select("-password"); // Exclude password

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

// WebSocket Authentication Middleware
export const socketAuthenticator = async (socket, next) => {
  try {
    let token = 
      socket.handshake.auth?.token || 
      socket.handshake.headers?.authorization?.split(" ")[1] || 
      socket.handshake.headers?.authorization || 
      socket.request.cookies?.token;
    
    if (!token) {
      console.error("No token found. Sources checked: auth, headers, cookies.");
      return next(new Error("Authentication required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return next(new Error("Invalid authentication token"));
    }

    const user = await User.findById(decoded.userId).select("_id name email");

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach minimal user data
    socket.user = { _id: user._id, name: user.name, email: user.email };
    console.log("✅ Socket authenticated for user:", user._id.toString());

    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    return next(new Error("Authentication error"));
  }
};
