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
    console.log('Login attempt for:', req.body.email);
    
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError("Invalid credentials", 401));
    }

    console.log('Login successful for:', user.email);
    
    // Update last active status
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token and send response - use one function call only
    generateToken(res, user, "Logged in successfully", 200);
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
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: "/"
    };

    // Clear the token cookie
    res.clearCookie('token', cookieOptions);
    
    res.status(200).json({
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
    console.log('Google auth attempt');
    
    const { token } = req.body;

    if (!token) {
        return next(new AppError("Google token is required", 400));
    }

    try {
        // Verify Google token
        const payload = await verifyGoogleToken(token);
        console.log('Google token verified for:', payload.email);

        // Find or create user
        let user = await User.findOne({
            $or: [{ googleId: payload.sub }, { email: payload.email }]
        });

        let isNewUser = false;
        
        if (!user) {
            // Create new user with Google data
            isNewUser = true;
            console.log('Creating new user from Google login:', payload.email);
            
            user = await User.create({
                name: payload.name,
                email: payload.email,
                username: payload.email.split('@')[0] + Math.floor(Math.random() * 10000),
                googleId: payload.sub,
                avatar: { url: payload.picture },
                password: crypto.randomBytes(16).toString('hex'),
                isEmailVerified: payload.email_verified
            });
        } else if (!user.googleId) {
            // Update existing user with Google ID if not already set
            console.log('Linking Google ID to existing user:', user.email);
            
            user.googleId = payload.sub;
            if (payload.picture && (!user.avatar || !user.avatar.url)) {
                user.avatar = { url: payload.picture };
            }
            await user.save();
        }

        // Generate token and send response
        console.log('Generating token for Google auth user:', user.email);
        generateToken(res, user, isNewUser ? "Account created successfully" : "Welcome back", 200);
    } catch (error) {
        console.error('Google auth error:', error);
        return next(new AppError(error.message, 401));
    }
});
