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

// Role-based access control
export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      throw new AppError("You are not logged in.", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  });
};
