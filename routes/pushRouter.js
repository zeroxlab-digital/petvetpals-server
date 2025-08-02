import express from "express";
import { savePushSubscription, sendPushNotifications } from "../controllers/pushController.js";

const pushRouter = express.Router();

pushRouter.post("/subscribe", savePushSubscription);
pushRouter.post("/send", sendPushNotifications);

export default pushRouter;