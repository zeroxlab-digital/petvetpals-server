import express from "express";
import userAuthenticated from "../../middlewares/userAuthenticated.js";
import { deleteReminder, getReminders, resetReminders, scheduleReminder } from "../../controllers/reminder/reminderController.js";
const reminderRouter = express.Router();

reminderRouter.post("/schedule-reminder", userAuthenticated, scheduleReminder);
reminderRouter.get("/get-reminders", userAuthenticated, getReminders);
reminderRouter.get("/reset-reminders", userAuthenticated, resetReminders);
reminderRouter.delete("/delete-reminder/:id", userAuthenticated, deleteReminder)

export default reminderRouter;