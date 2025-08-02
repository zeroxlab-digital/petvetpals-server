import { ScheduleReminder } from "../models/medicationsModel.js";
import { PushSubscription } from "../models/pushSubscription.js";
import webpush from "../utils/webPush.js";
import moment from "moment";

export const savePushSubscription = async (req, res) => {
    try {
        const sub = req.body;
        if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
            return res.status(400).json({ success: false, message: "Invalid subscription data" });
        }

        const existing = await PushSubscription.findOne({ endpoint: sub.endpoint });

        if (!existing) {
            await PushSubscription.create({
                ...sub,
                user: req.user?._id || null, // Optional
            });
        }

        res.status(200).json({ success: true, message: "Subscription saved" });
    } catch (error) {
        console.error("Error saving subscription:", error);
        res.status(500).json({ success: false, message: "Internal error" });
    }
};

export const sendPushNotificationsLogic = async () => {
    const now = moment();
    const subscriptions = await PushSubscription.find();
    const reminders = await ScheduleReminder.find()
        .populate({ path: "medication", select: "medication dosage" })
        .populate({ path: "pet", select: "name" });

    const dueReminders = [];

    reminders.forEach((reminder) => {
        (reminder.reminder_times || []).forEach((rt, index) => {
            if (rt.is_given || rt.skipped) return;

            const [hour, minute] = rt.time.split(":").map(Number);
            const reminderTime = moment(reminder.starting_date).set({ hour, minute });
            const remindBeforeMins = parseInt(rt.remind_before || "10");
            const diffMinutes = reminderTime.diff(now, "minutes");

            if (diffMinutes <= remindBeforeMins && diffMinutes >= remindBeforeMins - 1) {
                dueReminders.push({
                    reminderId: reminder._id,
                    index,
                    pet: reminder.pet,
                    medication: reminder.medication || {},
                    reminderTime: rt.time,
                    minutesLeft: diffMinutes,
                });
            }
        });
    });

    let sent = 0;

    for (const sub of subscriptions) {
        for (const reminder of dueReminders) {
            try {
                await webpush.sendNotification(
                    sub,
                    JSON.stringify({
                        title: `💊 ${reminder.medication.medication} Reminder`,
                        message: `🐾 ${reminder.pet.name}'s medication is due at ${reminder.reminderTime} (${reminder.minutesLeft} min left).`,
                        data: {
                            reminderId: reminder._id,
                            index: reminder.index, // index of the reminder_time
                        },
                        actions: [
                            {
                                action: "mark-as-given",
                                title: "Mark as Given"
                            }
                        ]
                    })
                );
                sent++;
            } catch (err) {
                console.warn("Push failed for", sub.endpoint);
                console.warn(err.body);

                if (err.statusCode === 410 || err.statusCode === 404) {
                    await PushSubscription.deleteOne({ endpoint: sub.endpoint });
                    console.log("Deleted expired subscription:", sub.endpoint);
                }
            }
        }
    }

    return sent;
};

export const sendPushNotifications = async (req, res) => {
    try {
        const sent = await sendPushNotificationsLogic();
        return res.json({ success: true, sent });
    } catch (err) {
        console.error("Push error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
