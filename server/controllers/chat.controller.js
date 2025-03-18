import { AppError, catchAsync } from "../middlewares/error.middleware.js";
import{ Chat }from '../models/chat.model.js'
import emitEvent from "../utils/Emit.js";
import { ALERT,REFETCH_CHATS } from "../constants.js";
import { User } from "../models/user.model.js";

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

export const getMyGroups=catchAsync(async(req,res,next)=>{
    const groups=await Chat.find({members:req.id,isGroupChat:true}).populate('members','name avatar');

    const filteredGroups=groups.map(({members,_id,groupChat,name})=>({
        members:members.filter(member=>member._id.toString()!==req.id),
        _id,
        groupChat,
        name,
        avatar:members.slice(0,3).map(({avatar})=>avatar?.url)
    })
    )
    res.status(200).json({
        status:"success",
        data:{
            groups:filteredGroups
        }
    })
}
)

export const addMembers = catchAsync(async (req, res, next) => {
    const { chatId, members } = req.body;
    const chat = await Chat.findById(chatId);
    
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

    if (!Array.isArray(members) || members.length === 0) {
        throw new AppError("Please provide members to add", 400);
    }

    const newMembers = [...new Set(members)];

    // Check for duplicates with existing members
    const duplicateMembers = newMembers.filter(id => chat.members.includes(id));
    if (duplicateMembers.length > 0) {
        throw new AppError("Some members are already in the group", 400);
    }

    const allNewMembers = await User.find({ _id: { $in: newMembers } }, "name");
    if (allNewMembers.length !== newMembers.length) {
        throw new AppError("Some users not found", 404);
    }

    // Check member limit before adding
    if (chat.members.length + newMembers.length > 100) {
        throw new AppError("Members limit exceeded", 400);
    }

    chat.members.push(...newMembers);
    await chat.save();

    const allUsersName = allNewMembers.map(i => i.name).join(', ');

    emitEvent(
        req,
        ALERT,
        chat.members,
        `${allUsersName} have been added to ${chat.name} group`
    );
    emitEvent(req, REFETCH_CHATS, chat.members);
    
    return res.status(200).json({
        success: true,
        message: "Members added successfully"
    });
});