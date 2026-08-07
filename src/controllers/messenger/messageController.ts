import { NextFunction, Request, Response } from "express";
import { Conversation } from "../../models/messenger/conversationModel.js";
import { Message } from "../../models/messenger/messageModel.js";
import { User } from "../../models/userModel.js";

export const handleSendMessage = async (req: Request<{id: string}, {}, { message: string }>, res: Response, next: NextFunction) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (!req.role) {
            return res.status(401).json({ message: "Sender role isn't defined from middleware!" });
        }
        // Sets the role
        let userId: string, vetId: string;
        if (req.role === "user") {
            userId = senderId;
            vetId = receiverId;
        } else {
            vetId = senderId;
            userId = receiverId;
        }
        let gotConversation = await Conversation.findOne({ user: userId, vet: vetId });
        if (!gotConversation) {
            gotConversation = await Conversation.create({ user: userId, vet: vetId });
        }
        const newMessage = await Message.create({
            user: userId,
            vet: vetId,
            senderType: req.role,
            message
        })
        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }
        await gotConversation.save();

        // Socket.io To-Do

        res.status(201).json({ message: "A new message was sent!", newMessage })
    } catch (error: unknown) {
        next(error)
    }
}

export const handleGetMessage = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        if (!req.role) {
            return res.status(401).json({ message: "Invalid role! Must be user or vet" });
        }

        let userId: string, vetId: string;

        if (req.role === "user") {
            userId = senderId;
            vetId = receiverId;
        } else {
            vetId = senderId;
            userId = receiverId;
        }

        const conversation = await Conversation.findOne({
            user: userId,
            vet: vetId
        }).populate("messages");

        if (!conversation) {
            return res.status(404).json({ message: "No conversation found!" });
        }

        // Extra security check: ensure the requester is actually a participant
        if (conversation.user.toString() !== senderId && conversation.vet.toString() !== senderId) {
            return res.status(403).json({ message: "You are not authorized to view these messages!" });
        }

        res.status(200).json({ success: true, messages: conversation.messages });
    } catch (error: unknown) {
        next(error)
    }
};


export const handleGetUsersMessasged = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vetId = req.id;
        const conversation = await Conversation.find({ vet: vetId }).select("user");
        if(!conversation.length) {
            return res.status(404).json({ message: "No conversation found!" })
        }
        const users = await User.find({ _id: conversation.map(convo => convo.user) }).select("-password -__v -address");
        res.status(200).json({ success: true, users })
    } catch (error: unknown) {
        next(error)
    }
}