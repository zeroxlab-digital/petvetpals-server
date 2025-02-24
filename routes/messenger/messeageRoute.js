import express from "express";
import { handleGetMessage, handleGetUsersMessasged, handleSendMessage } from "../../controllers/messenger/messageController.js";
import authenticatedUserOrVet from "../../middlewares/authenticatedUserOrVet.js";
import vetAuthenticated from "../../middlewares/vetAuthenticated.js";
const messageRouter = express.Router();

messageRouter.get("/users-messaged", vetAuthenticated, handleGetUsersMessasged);
messageRouter.post("/send/:id", authenticatedUserOrVet, handleSendMessage);
messageRouter.get("/:id", authenticatedUserOrVet, handleGetMessage);


export default messageRouter;