import { catchAsync } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateTokens.js";
import { AppError } from "../middlewares/error.middleware.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import emitEvent from "../utils/Emit.js";
import { NEW_FRIEND_REQUEST, REFETCH_CHATS } from "../constants.js";
import client, { verifyGoogleToken } from "../utils/googleClient.js";
import crypto from 'crypto';
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import e from "express";
import path from "path";

export const registerUser = catchAsync(async (req, res, next) => {
    const { name, username, email, password, bio } = req.body;
    const file = req.file

    if (!file) {
        throw new AppError("Please upload Avatar", 400);
    }

    // Basic validation
    if (!name || !email || !password) {
        throw new AppError("All fields are required", 400);
    }

    // Check for existing user by email or username
    const existingUser = await User.findOne({
        $or: [{ email }]
    });

    if (existingUser) {
        throw new AppError("User already exists with this email or username", 400);
    }

    const result = await uploadMedia(file?.path);

    const avatar = {
        public_id: result.public_id,
        url: result.secure_url
    }


    // Create new user
    const newUser = await User.create({
        name,
        email,
        username,
        avatar,
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

export const getProfile = catchAsync(async (req, res, next) => {
    try {
        let user;

        if (!req.params.id || req.params.id === req.id) {
            // If no ID is provided or the ID matches the current user, return their profile
            user = await User.findById(req.id);
            if (!user) {
                return next(new AppError("User not found", 404));
            }
        } else {
            // Fetch another user's profile
            user = await User.findById(req.params.id);
            if (!user) {
                return next(new AppError("User not found", 404));
            }
        }

        // Set appropriate CORS header for profile requests
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        
        res.status(200).json({
            status: "success",
            data: { user }
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
});

export const updateUser = catchAsync(async (req, res, next) => {
    const { name,  bio } = req.body;
    const file = req.file;
    const userId = req.id;
    // Check if email or username is already taken by another user`

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Update object
    const updateData = { name, bio };

    // Handle avatar update if file is provided
    if (file) {
        // Delete old image if exists
        if (user.avatar?.public_id) {
            await deleteMediaFromCloudinary(user.avatar.public_id);
        }
        
        const result = await uploadMedia(file.path);
        updateData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true }
    );

    await updatedUser.updateLastActive();
    
    // Generate token and send response
    generateToken(res, updatedUser, "Profile updated successfully", 200);
});
export const signout = catchAsync(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,  // Ensures immediate removal
    path: "/"
});

    return res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
});



export const searchUser = catchAsync(async (req, res) => {
    const { name = "" } = req.query;

    // Finding All my chats
    const myChats = await Chat.find({ groupChat: false, members: req.id });

    //  extracting All Users from my chats means friends or people I have chatted with
    const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

    // Finding all users except me and my friends
    const allUsersExceptMeAndFriends = await User.find({
        _id: { $nin: allUsersFromMyChats },
        name: { $regex: name, $options: "i" },
    });

    // Modifying the response
    const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url,
    }));

    return res.status(200).json({
        success: true,
        users,
    });
});

export const sendFriendRequest = catchAsync(async (req, res, next) => {
    const { receiverId } = req.body;
    if (receiverId.toString() === req.id.toString()) {
        throw new AppError("You cannot send request to yourself", 400)
    }
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
            message: "Request sent",
            data: {
                request
            }
        })
})

export const acceptFriendRequest = catchAsync(async (req, res) => {
    const { requestId, accept } = req.body;
    if (!requestId) {
        throw new AppError("Request id is required", 400)
    }
    if (accept === undefined) {
        throw new AppError("Accept field is required", 400)
    }
    if (typeof accept !== "boolean") {
        throw new AppError("Accept field must be a boolean", 400)
    }
    const request = await Request.findById(requestId)
        .populate("sender", "name")
        .populate("receiver", "name")
    if (!request) {
        throw new AppError("Request not found", 404)
    }
    if (request.receiver._id.toString() !== req.id.toString()) {
        throw new AppError("You are not authorized to accept this request", 403)
    }
    if (!accept) {
        await request.deleteOne();
        return res
            .status(200)
            .json({
                status: "success",
                message: "Request declined"
            })
    }
    const members = [request.sender._id, request.receiver._id]
    await Promise.all([Chat.create({
        members,
        name: `${request.sender.name}-${request.receiver.name}`
    }),
    request.deleteOne()
    ])
    emitEvent(req, REFETCH_CHATS, members, "new chat")
    return res
        .status(200)
        .json({
            status: "success",
            message: "Request accepted",
            senderId: request.sender._id
        })
})

export const getAllNotifications = catchAsync(async (req, res, next) => {
    const requests = await Request.find({ receiver: req.id }).populate("sender", "name avatar")
    const allRequests = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url
        }
    }))
    return res
        .status(200)
        .json({
            status: "success",
            data: {
                requests: allRequests
            }
        })
})

//todo :: getmyfriends and add validations
export const getMyFriends = catchAsync(async (req, res, next) => {
    const chatId = req.query?.chatId;

    // Find all non-group chats where user is a member
    const chats = await Chat.find({
        members: req.id,
        isGroupChat: false,
    }).populate("members", "name avatar");

    if (!chats.length) {
        return res.status(200).json({
            success: true,
            friends: [],
        });
    }

    // Extract friends from chats
    const friends = chats.map(({ members }) => {
        const friend = members.find(member => member._id.toString() !== req.id.toString());
        return {
            _id: friend._id,
            name: friend.name,
            avatar: friend.avatar.url
        };
    });

    // If chatId is provided, filter out members already in that chat
    if (chatId) {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new AppError("Chat not found", 404);
        }

        const availableFriends = friends.filter(
            (friend) => {
                return !chat.members.includes(friend._id)
            }
        );

        return res.status(200).json({
            success: true,
            friends: availableFriends,
        });
    }

    return res.status(200).json({
        success: true,
        friends,
    });
});

export const googleAuth = catchAsync(async (req, res, next) => {
    const { token } = req.body; // ID token from Google

    if (!token) {
        throw new AppError("Google token is required", 400);
    }

    try {
        // Use the enhanced verification function instead of direct client verification
        const payload = await verifyGoogleToken(token);

        // Check if user exists with this Google ID or email
        let user = await User.findOne({
            $or: [
                { googleId: payload.sub },
                { email: payload.email }
            ]
        });

        if (!user) {
            // Create a new user
            user = await User.create({
                name: payload.name,
                email: payload.email,
                username: payload.email.split('@')[0] + Math.floor(Math.random() * 10000), // Generate a username
                googleId: payload.sub,
                avatar: {
                    url: payload.picture
                },
                password: crypto.randomBytes(16).toString('hex'), // Random password for Google users
                isEmailVerified: payload.email_verified
            });
        } else if (!user.googleId) {
            // If user exists with same email but not linked to Google
            user.googleId = payload.sub;
            if (payload.picture && (!user.avatar || !user.avatar.url)) {
                user.avatar = { url: payload.picture };
            }
            await user.save();
        }

        // Update last active status
        await user.updateLastActive();

        // Generate token and send response
        generateToken(res, user, user.isNewUser ? "Account created successfully" : "Welcome back", 200);
    } catch (error) {
        // Our verifyGoogleToken already wraps and enhances the error messages
        throw new AppError(error.message, 401);
    }
});
