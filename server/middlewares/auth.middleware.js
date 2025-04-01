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
  try {
    let token = null;
    
    // Try to get token from cookies first
    if (socket.request.cookies && socket.request.cookies.token) {
      token = socket.request.cookies.token;
      console.log("Token found in cookies");
    }
    // Then try auth object
    else if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
      console.log("Token found in auth object");
    }
    // Finally check headers
    else if (socket.handshake.headers.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      console.log("Token found in headers");
    }
    
    if (!token) {
      console.error("No token found in socket request");
      console.log("Socket handshake details:", {
        auth: socket.handshake.auth,
        query: socket.handshake.query,
        headers: socket.handshake.headers,
        cookies: socket.request.cookies
      });
      return next(new Error("Authentication token is missing"));
    }
    
    try {
      const decodedData = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decodedData.userId) {
        console.error("Invalid token - missing userId");
        return next(new Error("Invalid authentication token"));
      }
      
      const user = await User.findById(decodedData.userId);
      
      if (!user) {
        console.error("User not found for ID:", decodedData.userId);
        return next(new Error("User not found"));
      }
      
      // Attach user to socket
      socket.user = user;
      socket.userId = user._id;
      console.log(`Socket authenticated for user: ${user.name} (${user._id})`);
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return next(new Error(`Invalid token: ${jwtError.message}`));
    }
  } catch (error) {
    console.error("Socket authentication error:", error);
    return next(new Error("Authentication error"));
  }
};