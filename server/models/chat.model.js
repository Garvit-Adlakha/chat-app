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