import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vet",
        required: true
    },
    senderType: {
        type: String,
        enum: ["user", "vet"],
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const Message = mongoose.model("Message", messageModel);