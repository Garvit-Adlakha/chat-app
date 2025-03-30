import mongoose ,{Schema} from "mongoose"
const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupIcon: {
        publicId: {
            type: String,
            default: "chat-app-default/default-group-icon"
        },
        url: {
            type: String,
            default: "https://icon-library.com/images/group-chat-icon/group-chat-icon-17.jpg"
        }
    },
    creator: {
        type:Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
}, {
    timestamps: true
})

export const Chat = mongoose.model('Chat', chatSchema)