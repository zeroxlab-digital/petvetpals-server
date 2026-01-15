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
        const reminders = await Reminder.find().populate({ path: "user", select: "timezone" });
        console.log("reminders:", reminders)
        let resetCount = 0;
        let deletedCount = 0;

        for (const reminder of reminders) {
            const userTz = reminder.user?.timezone || "UTC";
            const currentUserTime = moment().tz(userTz);

            let shouldDelete = false;

            // Delete one-time reminders ONLY if reminder_date is before today
            if (reminder.frequency === "one_time" && reminder.reminder_date) {
                const reminderDate = moment(reminder.reminder_date)
                    .utc()
                    .tz(userTz, true)
                    .startOf("day");

                const today = currentUserTime.clone().startOf("day");

                if (reminderDate.isBefore(today)) {
                    shouldDelete = true;
                }
            }

            // Delete any reminder (recurring or one-time) where end_date has passed
            if (reminder.end_date) {
                const endDate = moment(reminder.end_date).tz(userTz).startOf('day');
                const today = currentUserTime.clone().startOf('day');

                // Only delete if end_date is BEFORE today (not including today)
                if (endDate.isBefore(today, 'day')) {
                    shouldDelete = true;
                }
            }

            if (shouldDelete) {
                await Reminder.deleteOne({ _id: reminder._id });
                deletedCount++;
                console.log(`🗑️ Deleted expired reminder for user ${reminder.user?._id}, id ${reminder._id}`);
                continue; // as a result we skip to next reminder
            }

            // Reset logic for active reminders
            let reminderUpdated = false;

            for (let i = 0; i < (reminder.reminder_times || []).length; i++) {
                const rt = reminder.reminder_times[i];

                // Skip if already marked for reset today
                if (rt.last_reset) {
                    const lastResetDate = moment(rt.last_reset).tz(userTz).startOf('day');
                    const today = currentUserTime.clone().startOf('day');

                    // If already reset today, skip
                    if (lastResetDate.isSame(today, 'day')) {
                        continue;
                    }
                }

                const [hour, minute] = rt.time.split(":").map(Number);
                const reminderTimeToday = currentUserTime.clone().set({
                    hour,
                    minute,
                    second: 0,
                    millisecond: 0
                });

                const lastReset = rt.last_reset
                    ? moment(rt.last_reset).tz(userTz)
                    : moment(reminder.starting_date).tz(userTz);

                const diffDays = currentUserTime.diff(lastReset, "days");
                const diffMonths = currentUserTime.diff(lastReset, "months");

                let shouldReset = false;

                // Only reset if the reminder time has passed today
                const hasTimePassed = currentUserTime.isAfter(reminderTimeToday);

                switch (reminder.frequency) {
                    case "daily_once":
                    case "daily_twice":
                        // Reset daily if at least 1 day has passed AND the time has passed today
                        shouldReset = diffDays >= 1 && hasTimePassed;
                        break;
                    case "bi-weekly":
                        // Reset every 3 days (bi-weekly = twice a week ≈ every 3-4 days)
                        shouldReset = diffDays >= 3 && hasTimePassed;
                        break;
                    case "weekly":
                        // Reset weekly (7 days)
                        shouldReset = diffDays >= 7 && hasTimePassed;
                        break;
                    case "monthly":
                        // Reset monthly
                        shouldReset = diffMonths >= 1 && hasTimePassed;
                        break;
                    case "one_time":
                        // One-time reminders never reset
                        shouldReset = false;
                        break;
                    default:
                        shouldReset = false;
                }

                if (shouldReset) {
                    reminder.reminder_times[i].is_given = false;
                    reminder.reminder_times[i].notification_sent = false;
                    reminder.reminder_times[i].skipped = false;
                    reminder.reminder_times[i].last_reset = currentUserTime.toDate();
                    reminderUpdated = true;
                    resetCount++;
                    console.log(`✅ Reset reminder for user ${reminder.user?._id}, id ${reminder._id}, time index ${i}`);
                }
            }

            if (reminderUpdated) {
                await reminder.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: `Reset ${resetCount} reminder times and deleted ${deletedCount} expired reminders.`,
            resetCount,
            deletedCount
        });
    } catch (error) {
        console.error("Reset reminders error:", error);
        res.status(500).json({
            success: false,
            message: "Reminder reset failed! Please try again later.",
            error: error.message,
        });
    }
};

export const markGivenReminder = async (req, res) => {
    try {
        const userId = req.id;
        const reminderId = req.query?.id || req.body?.id;
        const timeIndex = req.query?.timeIndex || req.body?.timeIndex;
        // console.log("reminderId & timeIndex::", reminderId, timeIndex);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
        }
        if (!reminderId || timeIndex === undefined) {
            return res.status(400).json({ success: false, message: "Invalid request parameters. Reminder ID and time index are required." });
        }

        const updatedReminder = await Reminder.findOneAndUpdate({ _id: reminderId, user: userId }, {
            $set: {
                [`reminder_times.${timeIndex}.is_given`]: true,
                [`reminder_times.${timeIndex}.last_given`]: new Date(),
            }
        }, { new: true });
        // console.log("Updated reminder:", updatedReminder);
        res.status(200).json({ success: true, message: "Reminder marked as given successfully", reminder: updatedReminder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to mark reminder as given! Please try again later.", error: error.message });
    }
}

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