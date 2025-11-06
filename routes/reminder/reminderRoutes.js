import express from "express";
import { Reminder } from "../../models/reminders/remindersSchema.js";
import userAuthenticated from "../../middlewares/userAuthenticated.js";
import { ScheduleReminder } from "../../models/medicationsModel.js";
import { Pet } from "../../models/petModel.js";
const reminderRouter = express.Router();

reminderRouter.post("/schedule-reminder", userAuthenticated, async (req, res) => {
    try {
        const id = req.id;
        const { reminder_type, frequency, reminder_date, starting_date, end_date, reminder_times, notes, reminder_methods, repeat_reminder } = req.body;
        const newReminder = await Reminder.create({
            user: id,
            reminder_type, frequency, reminder_date, starting_date, end_date, reminder_times, notes, reminder_methods, repeat_reminder
        })
        console.log(newReminder);
        res.status(201).json({ success: true, message: "Reminder scheduled successfully", reminder: newReminder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error. Please try again later.", error: error.message });
    }
})
reminderRouter.get("/get-reminders", userAuthenticated, async (req, res) => {
    try {
        const id = req.id;

        const generalReminders = await Reminder.find({ user: id });

        // const pets = await Pet.find({ user: id });
        // const petIds = pets.map(p => p._id);
        // const medicationReminders = await ScheduleReminder.find({ pet: { $in: petIds } }).populate("medication", "medication").populate("pet", "name");

        const reminders = [
            ...generalReminders.map(r => ({
                _id: r._id,
                type: r.reminder_type || "General",
                frequency: r.frequency,
                reminder_date: r.reminder_date || null,
                starting_date: r.starting_date || null,
                end_date: r.end_date || null,
                reminder_times: r.reminder_times,
                // reminder_offset: r.reminder_times.map(rt => rt.reminde_before).join(", "),
                notes: r.notes,
                reminder_methods: r.reminder_methods,
                repeat_reminder: r.repeat_reminder,
            })),
            // ...medicationReminders.map(mr => ({
            //     _id: mr._id,
            //     type: "Medication",
            //     medication: mr.medication,
            //     pet: mr.pet,
            //     frequency: mr.frequency,
            //     reminder_date: mr.starting_date || null,
            //     starting_date: mr.starting_date || null,
            //     end_date: mr.end_date || null,
            //     reminder_times: mr.reminder_times,
            //     // reminder_offset: mr.reminder_times.map(rt => rt.remind_before).join(", "),
            //     notes: `Medication: ${mr.medication.medication} for ${mr.pet.name}`,
            //     reminder_methods: mr.reminder_methods,
            //     repeat_reminder: mr.repeat_reminder,
            // }))
        ]

        res.status(200).json({ success: true, reminders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error. Please try again later.", error: error.message });
    }
})

reminderRouter.delete("/delete-reminder/:id", userAuthenticated, async (req, res) => {
    try {
        const id = req.id;
        const reminderId = req.params.id;
        const reminder = await Reminder.findOneAndDelete({ _id: reminderId, user: id });
        if (!reminder) {
            return res.status(404).json({ success: false, message: "Reminder not found" });
        }
        res.status(200).json({ success: true, message: "Reminder deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error. Please try again later.", error: error.message });
    }
})

export default reminderRouter;