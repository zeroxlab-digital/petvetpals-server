import express from "express";
import { savePushSubscription } from "../controllers/pushController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";

const pushRouter = express.Router();

pushRouter.post("/subscribe", userAuthenticated, savePushSubscription);
// API ENDPOINT TEST
// pushRouter.post("/send", sendPushNotifications);

export default pushRouter;