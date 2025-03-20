import { catchAsync } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateTokens.js";
import { AppError } from "../middlewares/error.middleware.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import emitEvent from "../utils/Emit.js";
import { NEW_FRIEND_REQUEST } from "../constants.js";

export const registerUser = catchAsync(async (req, res, next) => {
    const { name, username, email, password, bio } = req.body;

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

export const getMyProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.id);
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
}
)

export const signout = catchAsync(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", "", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0
        })
        .json({
            status: "success",
            message: "Logged out successfully"
        });
});

export const searchUser = catchAsync(async (req, res, next) => {
    const { name } = req.query;
    console.log(req.id)
    const myChats = await Chat.find({ isGroupChat: false, members: req.id })
    const memberIds = myChats.flatMap(chat =>
        chat.members
    );
    const uniqueMembers = [...new Set(memberIds)];

    const allUsersExceptUniqueMembers = await User.find({
        _id: { $nin: uniqueMembers },
        name: { $regex: name, $options: "i" },
    })

    const users = allUsersExceptUniqueMembers.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url
    }))

    return res
        .status(200)
        .json({
            status: "success",
            message: "User found",
            data: {
                users
            }
        })
})

export const sendFriendRequest = catchAsync(async (req, res, next) => {
    const { receiverId } = req.body;
    console.log(receiverId)
    const senderId = req.id;
    const existingRequest = await Request.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
        ]
    }
    )
    if (existingRequest) {
        throw new AppError("Request already sent", 400)
    }
    const request = await Request.create({ sender: senderId, receiver: receiverId })
    emitEvent(req, NEW_FRIEND_REQUEST, [receiverId], "request sent")
    return res
        .status(200)
        .json({
            status: "success",
            message: "Request sent"
        })
})

