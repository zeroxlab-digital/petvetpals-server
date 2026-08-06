import express from "express";
import userAuthenticated from "../../middlewares/userAuthenticated.js";
import { deleteReminder, getReminders, markGivenReminder, resetReminders, scheduleReminder } from "../../controllers/reminder/reminderController.js";
const reminderRouter = express.Router();

reminderRouter.post("/schedule-reminder", userAuthenticated, scheduleReminder);
reminderRouter.get("/get-reminders", userAuthenticated, getReminders);
reminderRouter.get("/reset-reminders", userAuthenticated, resetReminders);
reminderRouter.patch("/markgiven-reminder", userAuthenticated, markGivenReminder);
reminderRouter.delete("/delete-reminder/:id", userAuthenticated, deleteReminder)

export default reminderRouter;