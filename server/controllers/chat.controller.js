import { AppError, catchAsync } from "../middlewares/error.middleware.js";
import { Chat } from '../models/chat.model.js'
import emitEvent from "../utils/Emit.js";
import { ALERT, REFETCH_CHATS } from "../constants.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

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
    const transformedChats = await Chat.aggregate([
        // Match chats where current user is a member
        {
            $match: {
                members: req.user._id // Use _id instead of req.user
            }
        },

        // Lookup members from User collection
        {
            $lookup: {
                from: "users", // Collection name is lowercase "users"
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
                    $cond: {
                        if: "$isGroupChat",
                        then: {
                            $slice: [
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
                                3
                            ]
                        },
                        else: {
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
                        }
                    }
                },
                name: {
                    $cond: {
                        if: "$isGroupChat",
                        then: "$name",
                        else: {
                            $arrayElemAt: ["$members.name", 0]
                        }
                    }
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
    const groups = await Chat.find({ members: req.id, isGroupChat: true }).populate('members', 'name avatar');

    const filteredGroups = groups.map(({ members, _id, groupChat, name }) => ({
        members: members.filter(member => member._id.toString() !== req.id),
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar?.url)
    })
    )
    res.status(200).json({
        status: "success",
        data: {
            groups: filteredGroups
        }
    })
}
)

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

    if (!chat.members.includes(req.id)) {
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

    if (!chat.members.some(member=>member.toString() === req.id.toString())) {
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

export const deleteChat = catchAsync(async (req, res, next) => {
    const { id: chatId } = req.params;

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        throw new AppError("Invalid chat ID", 400);
    }
    // Check if chat exists
    const chat = await Chat.findById({
        _id: chatId
    }).lean()

    if (!chat) {
        throw new AppError("Chat not found", 404)
    }

    if (chat.creator.toString() !== req.id) {
        throw new AppError("You are not authorized to delete this chat", 403)
    }

    await Chat.findByIdAndDelete(chatId);
    emitEvent(req, ALERT, chat.members, "Chat has been deleted")
    emitEvent(req, REFETCH_CHATS, chat.members)

    return res.status(200).json({
        success: true,
        message: "Chat deleted successfully",
        data: chat
    })

})

export const leaveGroup = catchAsync(async (req, res, next) => {
    const chatId  = req.params.id

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        throw new AppError("Invalid chat ID", 400);
    }

    const chat = await Chat.findById(chatId).lean()


    if (!chat) {
        throw new AppError("Chat not found", 404)
    }
    if (!chat.isGroupChat) {
        throw new AppError("This is not a group chat")
    }
    // if (chat.creator.toString() === req.id) {
    //     throw new AppError("You can't leave a group you created", 403)
    // }
    // Check if user is a member by comparing ObjectId strings
    if (!chat.members.some(member => member.toString() === req.id.toString())) {
        throw new AppError("You are not a member of this group", 400);
    }

    const remainingMembers = chat.members.filter((member) => member.toString() !== req.id.toString())

    if (remainingMembers < 3) {
        throw new AppError("Group must have at least 3 members")
    }

    if (chat.creator.toString() === req.id.toString()) {
        const newCreator = remainingMembers[Math.floor(Math.random() * remainingMembers.length)];
        await Chat.findByIdAndUpdate(chatId, { creator: newCreator });
    }
    const updatedChat = await Chat.findByIdAndUpdate
        (chatId,
            { $pull: { members: req.id } },
            { new: true }
        ).lean()

    emitEvent(req, ALERT, updatedChat.members, `${req.user.name} has left the group`)
    emitEvent(req, REFETCH_CHATS, updatedChat.members)

    return res.status(200).json({
        success: true,
        message: "You have left the group",
    })
})
