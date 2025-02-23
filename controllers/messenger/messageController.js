import { Conversation } from "../../models/messenger/conversationModel.js";
import { Message } from "../../models/messenger/messageModel.js";

export const handleSendMessage = async (req, res) => {
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
        let userId, vetId;
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
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error while sending message!", error: error.message })
    }
}

export const handleGetMessage = async (req, res) => {
    res.json("Get message!")
}