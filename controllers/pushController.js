import { ScheduleReminder } from "../models/medicationsModel.js";
import { PushSubscription } from "../models/pushSubscription.js";
import { Reminder } from "../models/reminders/remindersSchema.js";
import webpush from "../utils/webPush.js";
import moment from "moment-timezone";

export const savePushSubscription = async (req, res) => {
    try {
        const userId = req.id;
        const sub = req.body;
        if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
            return res.status(400).json({ success: false, message: "Invalid subscription data" });
        }

        const existing = await PushSubscription.findOne({ endpoint: sub.endpoint });

        if (!existing) {
            await PushSubscription.create({
                ...sub,
                user: userId || null,
            });
        }

        res.status(200).json({ success: true, message: "Subscription saved" });
    } catch (error) {
        console.error("Error saving subscription:", error);
        res.status(500).json({ success: false, message: "Internal error" });
    }
};

export const sendMedPushNotificationsLogic = async () => {
    const now = moment().tz("America/Chicago");
    const subscriptions = await PushSubscription.find();

    const reminders = await ScheduleReminder.find()
        .populate({ path: "medication", select: "medication dosage" })
        .populate({ path: "pet", select: "name user" })
        .populate({ path: "user", select: "_id" });

    const dueReminders = [];

    for (const reminder of reminders) {
        const tz = reminder.timezone || "America/Chicago";
        const currentDay = moment().tz(tz);

        for (const [index, rt] of (reminder.reminder_times || []).entries()) {
            if (rt.is_given || rt.skipped) continue;

            const [hour, minute] = rt.time.split(":").map(Number);
            const reminderTime = currentDay.clone().set({ hour, minute, second: 0, millisecond: 0 });
            const remindBeforeMins = parseInt(rt.remind_before || "10");
            const diffMinutes = reminderTime.diff(now, "minutes");

            // Prevent double notifications
            if (rt.last_notified && now.diff(rt.last_notified, "minutes") < 2) continue;

            if (diffMinutes <= remindBeforeMins && diffMinutes >= -1) {
                dueReminders.push({
                    reminder,
                    index,
                    pet: reminder.pet,
                    medication: reminder.medication || {},
                    reminderTime: rt.time,
                    minutesLeft: diffMinutes,
                });

                // Update the last_notified
                reminder.reminder_times[index].last_notified = now;
                await reminder.save();
            }
        }
    }

    let sent = 0;

    for (const due of dueReminders) {
        const { reminder, pet, medication, reminderTime, minutesLeft } = due;

        // This'll determine userId (reminder.user or pet.user)
        const userId = reminder.user?._id?.toString() || pet.user.toString();

        // Filter subscriptions for that user
        const userSubs = subscriptions.filter((s) => s.user?.toString() === userId);
        
        for (const sub of userSubs) {
            try {
                await webpush.sendNotification(
                    sub,
                    JSON.stringify({
                        title: `💊 ${medication.medication} Reminder`,
                        message: `🐾 ${pet.name}'s medication is due at ${reminderTime} (${minutesLeft} min left).`,
                        data: {
                            reminderId: reminder._id,
                            index: due.index,
                        },
                        actions: [
                            { action: "mark-as-given", title: "Mark as Given" },
                        ],
                    })
                );
                sent++;
            } catch (err) {
                console.warn("Push failed for", sub.endpoint);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await PushSubscription.deleteOne({ endpoint: sub.endpoint });
                    console.log("Deleted expired subscription:", sub.endpoint);
                }
            }
        }
    }

    return sent;
};

export const sendPushNotificationsLogic = async () => {
    const now = moment().tz("America/Chicago");
    const subscriptions = await PushSubscription.find();

    const reminders = await Reminder.find()
        .populate("reminder_times reminder_methods")

    const dueReminders = [];

    for (const reminder of reminders) {
        const tz = reminder.timezone || "America/Chicago";
        const currentDay = moment().tz(tz);

        for (const [index, rt] of (reminder.reminder_times || []).entries()) {
            if (rt.is_given || rt.skipped) continue;

            const [hour, minute] = rt.time.split(":").map(Number);
            const reminderTime = currentDay.clone().set({ hour, minute, second: 0, millisecond: 0 });
            const remindBeforeMins = parseInt(rt.reminde_before || "10");
            const diffMinutes = reminderTime.diff(now, "minutes");

            if (diffMinutes <= remindBeforeMins && diffMinutes >= -1) {
                dueReminders.push({
                    reminder,
                    index,
                    reminderTime: rt.time,
                    minutesLeft: diffMinutes,
                });

                await reminder.save();
            }
        }
    }

    let sent = 0;

    for (const due of dueReminders) {
        const { reminder, reminderTime, minutesLeft } = due;

        const userSubs = subscriptions.filter((s) => s.user?.toString() === reminder.user?.toString());

        for (const sub of userSubs) {
            try {
                await webpush.sendNotification(
                    sub,
                    JSON.stringify({
                        title: `🐾 ${reminder.reminder_type} Reminder`,
                        message: `${reminder.reminder_type} • ${reminder.notes} is due at ${reminderTime} (${minutesLeft} min left).`,
                        data: {
                            reminderId: reminder._id,
                            index: due.index,
                        },
                        actions: [
                            { action: "mark-as-done", title: "Mark as Done" }
                        ],
                    })
                );
                sent++;
            } catch (err) {
                console.warn("Push failed for", sub.endpoint);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await PushSubscription.deleteOne({ endpoint: sub.endpoint });
                    console.log("Deleted expired subscription:", sub.endpoint);
                }
            }
        }
    }

    return sent;
};