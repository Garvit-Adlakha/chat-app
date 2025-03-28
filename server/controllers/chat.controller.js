import { AppError, catchAsync } from "../middlewares/error.middleware.js";
import { Chat } from '../models/chat.model.js'
import emitEvent from "../utils/Emit.js";
import { ALERT, REFETCH_CHATS } from "../constants.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadMedia, deleteMediaFromCloudinary, deleteVideoFromCloudinary } from "../utils/cloudinary.js";
import { Message } from "../models/message.model.js";
import { NEW_MESSAGE_ALERT, NEW_ATTACHMENT_ALERT } from "../constants.js";

export const newGroupChat = catchAsync(async (req, res, next) => {
    const { name, members } = req.body;

    if (!name?.trim()) {
        throw new AppError("Group name is required", 400);
    }

    if (!Array.isArray(members) || members.length < 2) {
        throw new AppError("Please add at least 2 members to create a group", 400);
    }

    const allMembers = [...new Set([...members, req.id])]; // Remove duplicates

    const chat = await Chat.create({
        name: name.trim(),
        isGroupChat: true,
        creator: req.id,
        members: allMembers
    });

    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return res
        .status(201)
        .json({
            message: "Group created successfully",
            chat
        });
});

export const getMyChats = catchAsync(async (req, res, next) => {
    console.log(req.id)
    const transformedChats = await Chat.aggregate([
        // Match chats where current user is a member AND isGroupChat is false
        {
            $match: {
                members: req.user._id,
                isGroupChat: false
            }
        },

        // Lookup members from User collection
        {
            $lookup: {
                from: "users",
                localField: "members",
                foreignField: "_id",
                as: "members"
            }
        },

        // First project to handle members 
        {
            $project: {
                _id: 1,
                name: 1,
                isGroupChat: 1,
                createdAt: 1,
                updatedAt: 1,
                members: {
                    $filter: {
                        input: "$members",
                        as: "member",
                        cond: { $ne: ["$$member._id", req.user._id] }
                    }
                }
            }
        },

        // Second project to format the response
        {
            $project: {
                _id: 1,
                groupChat: "$isGroupChat",
                createdAt: 1,
                updatedAt: 1,
                members: {
                    $map: {
                        input: "$members",
                        as: "member",
                        in: {
                            _id: "$$member._id",
                            name: "$$member.name",
                            avatar: "$$member.avatar",
                            email: "$$member.email"
                        }
                    }
                },
                avatar: {
                    $arrayElemAt: [
                        {
                            $map: {
                                input: "$members",
                                as: "m",
                                in: {
                                    $cond: {
                                        if: { $ifNull: ["$$m.avatar.url", false] },
                                        then: "$$m.avatar.url",
                                        else: null
                                    }
                                }
                            }
                        },
                        0
                    ]
                },
                name: {
                    $arrayElemAt: ["$members.name", 0]
                }
            }
        },

        // Sort by latest updated
        {
            $sort: {
                updatedAt: -1
            }
        }
    ]);

    if (!transformedChats) {
        throw new AppError("No chats found", 404);
    }

    return res.status(200).json({
        success: true,
        results: transformedChats.length,
        chats: transformedChats
    });
});

export const getMyGroups = catchAsync(async (req, res, next) => {
    const chats = await Chat.find({
      members: req.user,
      groupChat: true,
      creator: req.id,
    }).populate("members", "name avatar");
  
    const groups = chats.map(({ members, _id, groupChat, name }) => ({
      _id,
      groupChat,
      name,
      avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
    }));
  
    return res.status(200).json({
      success: true,
      groups,
    });
  });
export const addMembers = catchAsync(async (req, res, next) => {
    const { chatId, members } = req.body;

    // Input validation
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        throw new AppError("Invalid chat ID", 400);
    }

    if (!Array.isArray(members) || members.length === 0) {
        throw new AppError("Please provide valid members to add", 400);
    }

    if (!members.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new AppError("Invalid member ID(s)", 400);
    }

    const newMembers = [...new Set(members)];

    // Check member limit
    const chat = await Chat.findById(chatId).lean();
    if (!chat) {
        throw new AppError("Chat not found", 404);
    }

    if (!chat.isGroupChat) {
        throw new AppError("This is not a group chat", 400);
    }

    if (chat.creator.toString() !== req.id) {
        throw new AppError("You are not authorized to add members", 403);
    }

    if (!chat.members.some(member => member.toString() === req.id.toString())) {
        throw new AppError("You are not a member of this group", 400);
    }

    // Check for duplicates
    const duplicateMembers = newMembers.filter(id =>
        chat.members.some(memberId => memberId.toString() === id)
    );
    if (duplicateMembers.length > 0) {
        throw new AppError(`Members already in group: ${duplicateMembers.join(', ')}`, 400);
    }

    if (chat.members.length + newMembers.length > 100) {
        throw new AppError("Members limit exceeded (max 100)", 400);
    }

    // Perform updates
    try {
        const [updatedChat, allNewMembers] = await Promise.all([
            Chat.findOneAndUpdate(
                { _id: chatId },
                { $addToSet: { members: { $each: newMembers } } },
                { new: true }
            ),
            User.find({ _id: { $in: newMembers } }, "name").lean()
        ]);

        if (allNewMembers.length !== newMembers.length) {
            const foundIds = allNewMembers.map(m => m._id.toString());
            const missingIds = newMembers.filter(id => !foundIds.includes(id));
            throw new AppError(`Users not found: ${missingIds.join(', ')}`, 404);
        }

        // Emit events
        const allUsersName = allNewMembers.map(m => m.name).join(', ');
        emitEvent(
            req,
            ALERT,
            updatedChat.members,
            `${allUsersName} have been added to ${chat.name} group`
        );
        emitEvent(req, REFETCH_CHATS, updatedChat.members);

        return res.status(200).json({
            success: true,
            message: "Members added successfully",
            data: {
                addedMembers: allNewMembers.map(m => ({
                    _id: m._id,
                    name: m.name
                })),
                totalMembers: updatedChat.members.length
            }
        });
    } catch (error) {
        throw new AppError(
            "Failed to add members: " + error.message,
            error.status || 500
        );
    }
});

export const removeMembers = catchAsync(async (req, res, next) => {
    const { chatId, members } = req.body

    // Input validation
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        throw new AppError("Invalid chat ID", 400);
    }

    if (!Array.isArray(members) || members.length === 0) {
        throw new AppError("Please provide valid members to add", 400);
    }

    if (!members.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new AppError("Invalid member ID(s)", 400);
    }

    const removedMembers = [...new Set(members)];

    const chat = await Chat.findById(chatId).lean();
    if (!chat) {
        throw new AppError("Chat not found", 404);
    }

    if (!chat.isGroupChat) {
        throw new AppError("This is not a group chat", 400);
    }

    if (chat.creator.toString() !== req.id) {
        throw new AppError("You are not authorized to remove members", 403);
    }

    if (!chat.members.some(member => member.toString() === req.id.toString())) {
        throw new AppError("You are not a member of this group", 400);
    }

    const remainingMembers = chat.members.filter(member => !removedMembers.includes(member.toString()));

    if (remainingMembers.length < 2) {
        throw new AppError("Group must have at least 2 members", 400)
    }


    try {
        const [updatedChat, allRemovedMembers] = await Promise.all([
            Chat.findOneAndUpdate(
                { _id: chatId },
                { $pull: { members: { $in: removedMembers } } },
                { new: true }
            ),
            User.find({ _id: { $in: removedMembers } }, "name").lean()
        ]);

        if (allRemovedMembers.length !== removedMembers.length) {
            const foundIds = allRemovedMembers.map(m => m._id.toString());
            const missingIds = removedMembers.filter(id => !foundIds.includes(id));
            throw new AppError(`Users not found: ${missingIds.join(', ')}`, 404);
        }

        const allUsersName = allRemovedMembers.map(m => m.name).join(', ');
        emitEvent(
            req,
            ALERT,
            updatedChat.members,
            `${allUsersName} have been removed from ${chat.name} group`
        );
        emitEvent(req, REFETCH_CHATS, updatedChat.members);

        return res.status(200).json({
            success: true,
            message: "Members removed successfully",
            data: {
                removedMembers: allRemovedMembers.map(m => ({
                    _id: m._id,
                    name: m.name
                })),
                totalMembers: updatedChat.members.length
            }
        });
    } catch (error) {
        throw new AppError(
            "Failed to remove members: " + error.message,
            error.status || 500
        );
    }

})

export const leaveGroup = catchAsync(async (req, res, next) => {
    const chatId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new AppError("Invalid chat ID", 400);
    }

    // Find chat and validate
    const chat = await Chat.findById(chatId)
        .select('members creator isGroupChat name')
        .lean();

    if (!chat) {
        throw new AppError("Chat not found", 404);
    }

    if (!chat.isGroupChat) {
        throw new AppError("This is not a group chat", 400);
    }

    // Check membership
    if (!chat.members.some(member => member.toString() === req.id)) {
        throw new AppError("You are not a member of this group", 400);
    }

    // Calculate remaining members
    const remainingMembers = chat.members
        .filter(member => member.toString() !== req.id);

    if (remainingMembers.length < 3) {
        throw new AppError("Group must have at least 3 members", 400);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        let updatedChat;

        if (chat.creator.toString() === req.id) {
            // If creator is leaving, randomly assign new creator
            const newCreator = remainingMembers[
                Math.floor(Math.random() * remainingMembers.length)
            ];

            updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $pull: { members: req.id },
                    $set: { creator: newCreator }
                },
                {
                    new: true,
                    session,
                    runValidators: true
                }
            ).lean();
        } else {
            // Regular member leaving
            updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                { $pull: { members: req.id } },
                {
                    new: true,
                    session,
                    runValidators: true
                }
            ).lean();
        }

        await session.commitTransaction();

        // Emit events after successful update
        emitEvent(
            req,
            ALERT,
            updatedChat.members,
            `${req.user.name} has left the group`
        );
        emitEvent(req, REFETCH_CHATS, updatedChat.members);

        return res.status(200).json({
            success: true,
            message: "You have left the group",
            data: {
                chatId: updatedChat._id,
                remainingMembers: updatedChat.members.length,
                newCreator: updatedChat.creator
            }
        });

    } catch (error) {
        await session.abortTransaction();
        throw new AppError(
            `Failed to leave group: ${error.message}`,
            error.status || 500
        );
    } finally {
        session?.endSession();
    }
});

export const sendAttachments = catchAsync(async (req, res, next) => {
    const { chatId } = req.body;

    const files = req.files

    if (files.length === 0) {
        throw new AppError("Please provide a file", 400)
    }
    if (files.length > 5) {
        throw new AppError("You can only send 5 files at a time", 400)
    }

    const [chat] = await Promise.all([
        Chat.findById(chatId)
    ])
    if (!chat) {
        throw new AppError("Chat not found", 404)
    }
    if (files.length < 1) {
        throw new AppError("Please provide a file", 400)
    }

    const attachments = await Promise.all(files.map(file => uploadMedia(file.path)));
    console.log(req.id)

    const messageForDb = {
        content: "",
        attachments: attachments.map(a => ({
            publicId: a.public_id,
            url: a.secure_url
        })),
        sender: req.id,
        name: req.user.name,
        chat: chatId
    }
    const message = await Message.create(messageForDb)

    const messageForEmit = {
        ...messageForDb,
        sender: {
            _id: req.id,
            name: req.user.name,
        },
        chat: chatId,
    }
    emitEvent(req, NEW_ATTACHMENT_ALERT, chat.members, {
        message: messageForEmit,
        chatId
    })

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res.status(200).json({
        success: true,
        message,
    });
})

export const getChatDetails = catchAsync(async (req, res, next) => {
    if (req.query.populate == 'true') {
        const chat = await Chat.findById(req.params.id).populate('members', 'name avatar').lean()
        if (!chat) {
            throw new AppError("Chat not found", 404)
        }
        chat.members = chat.members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar?.url
        }))
        return res.status(200).json({
            success: true,
            chat
        })
    }
    else {
        const chat = await Chat.findById(req.params.id).lean()
        if (!chat) {
            throw new AppError("Chat not found", 404)
        }
        return res.status(200).json({
            success: true,
            chat
        })
    }
})

export const renameGroup = catchAsync(async (req, res, next) => {
    const chatId = req.params.id
    const { name } = req.body

    const chat = await Chat.findById(chatId)
    if (!chat) {
        throw new AppError("Chat not found", 404)
    }
    if (!chat.members.some(member => member.equals(req.id))) {
        throw new AppError("You are not a member of this group", 400);
    }
    if (!chat.creator.equals(req.id)) {
        throw new AppError("You are not authorized to rename this group", 403);
    }
    if (!chat.isGroupChat) {
        throw new AppError("This is not a group chat", 400)
    }
    if (!name?.trim()) {
        throw new AppError("Please provide a group name", 400)
    }
    chat.name = name.trim()
    await chat.save()
    emitEvent(req, ALERT, chat.members, `Group name changed to ${name}`)
    emitEvent(req, REFETCH_CHATS, chat.members)
    return res.status(200).json({
        success: true,
        message: "Group name changed successfully",
        chat
    })
})

export const deleteChat = catchAsync(async (req, res, next) => {
    const chatId = req.params.id

    const chat = await Chat.findById(chatId)
    if (!chat) {
        throw new AppError("Chat not found", 404)
    }
    if (!chat.members.some(member => member.equals(req.id))) {
        throw new AppError("You are not a member of this group", 400);
    }
    const members = chat.members
    if (chat.isGroupChat && !chat.creator.equals(req.id)) {
        throw new AppError("You are not authorized to delete this group", 403)
    }
    if (chat.isGroupChat && !chat.members.includes(req.id)) {
        throw new AppError("You are not a member of this group", 400)
    }

    const messagesWithAttachments = await Message.find({
        chat: chatId,
        attachments: { $exists: true, $ne: [] }
    })

    const public_ids = messagesWithAttachments.map(message => message.attachments.map(a => a.publicId)).flat()
    if (public_ids.length > 0) {

        await Promise.all(
            [public_ids.map(public_id => deleteMediaFromCloudinary(public_id)),
            chat.deleteOne(),
            Message.deleteMany({ chat: chatId })
            ])
        emitEvent(req, ALERT, members, `Chat deleted`)
        emitEvent(req, REFETCH_CHATS, members)
    }
    return res.status(200).json({
        success: true,
        message: "Chat deleted successfully"
    })
})

export const getMessages = catchAsync(async (req, res, next) => {
    const chatId = req.params.id
    const {page=1}=req.query
    const limit=20
    const skip=(page-1)*limit

    const [messages, totalMessageCount] = await Promise.all([
        Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name')
        .lean(),
        Message.countDocuments({ chat: chatId })
    ])
    const totalPages=Math.ceil(totalMessageCount/limit)

    if (!messages) {
        throw new AppError("No messages found", 404)
    }

    return res.status(200).json({
        success: true,
        messages,
        totalPages,
        totalMessageCount,
        currentPage:page
    })
})