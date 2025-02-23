import express from "express";
import { handleGetMessage, handleSendMessage } from "../../controllers/messenger/messageController.js";
import authenticatedUserOrVet from "../../middlewares/authenticatedUserOrVet.js";
const messageRouter = express.Router();

messageRouter.post("/send/:id", authenticatedUserOrVet, handleSendMessage);
messageRouter.get("/:id", authenticatedUserOrVet, handleGetMessage)

export default messageRouter;