import { generateMersenne53Randomizer } from "@faker-js/faker";
import { catchAsync } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateTokens.js";
import { urlencoded } from "express";
import { AppError } from "../middlewares/error.middleware.js";

export const registerUser = catchAsync(async (req, res,next) => {
    const { name, username, email, password,bio } = req.body;

    // Basic validation
    if (!name || !username || !email || !password) {
        throw new AppError("All fields are required", 400);
    }

    // Check for existing user by email or username
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new AppError("User already exists with this email or username", 400);
    }

    // Create new user
    const newUser = await User.create({
        name,
        email,
        username,
        bio,
        password
    });

    // Update last active status
    await newUser.updateLastActive();

    // Generate token and send response
    generateToken(res, newUser, "User registered successfully", 201);
});

export const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        throw new AppError("Please provide email and password", 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError("Invalid credentials", 401);
    }

    // Update last active status
    await user.updateLastActive();

    // Generate token and send response
    generateToken(res, user, "Welcome Back", 200);
})

export const getMyProfile=catchAsync(async(req,res,next)=>{
    const user=await User.findById(req.id);
    res.status(200).json({
        status:"success",
        data:{
            user
        }
    })
}
)

export const signout = catchAsync(async (req, res, next) => {
    res
    .status(200)
    .cookie("token","",{
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production',
        maxAge:0
    })
    .json({
        status: "success",
        message: "Logged out successfully"
    });
});