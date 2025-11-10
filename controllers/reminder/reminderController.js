import moment from "moment-timezone";
import { Reminder } from "../../models/reminders/remindersSchema.js";

export const scheduleReminder = async (req, res) => {
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
}

export const getReminders = async (req, res) => {
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
}

export const resetReminders = async (req, res) => {
    try {
        const now = moment();
        // console.log("now:", now)
        const reminders = await Reminder.find();
        // console.log("reminders:", reminders);

        let resetCount = 0;

        for (const reminder of reminders) {

            if (reminder.end_date && moment(reminder.end_date).isBefore(now)) continue;

            let reminderUpdated = false;

            for (let i = 0; i < (reminder.reminder_times || []).length; i++) {
                const rt = reminder.reminder_times[i];
                const [hour, minute] = rt.time.split(":").map(Number);
                const reminderTimeToday = moment().set({ hour, minute, second: 0, millisecond: 0 });
                const lastReset = moment(rt.last_reset || reminder.starting_date);
                const diffDays = now.diff(lastReset, "days");

                let shouldReset = false;

                // console.log({
                //     reminderId: reminder._id,
                //     frequency: reminder.frequency,
                //     is_given: rt.is_given,
                //     last_reset: rt.last_reset,
                //     shouldReset,
                // });

                switch (reminder.frequency) {
                    case "daily_once":
                    case "daily_twice":
                        shouldReset = (diffDays >= 1 || !rt.last_reset) && now.isAfter(reminderTimeToday);
                        break;
                    case "bi-weekly":
                        shouldReset = diffDays >= 3 && now.isAfter(reminderTimeToday);
                        break;
                    case "weekly":
                        shouldReset = diffDays >= 7 && now.isAfter(reminderTimeToday);
                        break;
                    case "monthly":
                        shouldReset = now.diff(lastReset, "months") >= 1 && now.isAfter(reminderTimeToday);
                        break;
                    case "one_time":
                        shouldReset = false;
                        break;
                    default:
                        shouldReset = false;
                }

                if (shouldReset) {
                    reminder.reminder_times[i].is_given = false;
                    reminder.reminder_times[i].last_reset = now.toDate();
                    reminderUpdated = true;
                    resetCount++;
                    console.log(`✅ Reset reminder for user ${reminder.user}, id ${reminder._id}`);
                }
            }

            if (reminderUpdated) await reminder.save();
        }

        return res.status(200).json({ success: true, message: `Reset ${resetCount} reminder times.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Reminder reset failed! Please try again later.",
            error: error.message,
        });
    }
};

export const deleteReminder = async (req, res) => {
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
}