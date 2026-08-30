import { Request, Response, NextFunction } from "express";
import { MedicationReminder } from "../models/medicationsModel.js";
import { PushSubscription } from "../models/pushSubscription.js";
import webpush from "../utils/webPush.js";
import moment from "moment-timezone";
import { Types } from "mongoose";

interface PushSubscriptionDTO {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    user?: Types.ObjectId;
}

export const savePushSubscription = async (req: Request<{}, {}, PushSubscriptionDTO>, res: Response, next: NextFunction) => {
    try {
        const userId = req.id;
        const sub = req.body;

        if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
            return res.status(400).json({ success: false, message: "Invalid subscription data" });
        }

        // Always upsert , reassign to current user if endpoint already exists
        await PushSubscription.findOneAndUpdate(
            { endpoint: sub.endpoint },
            {
                ...sub,
                user: userId || null,
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "Subscription saved" });
    } catch (error: unknown) {
        next(error)
    }
};

interface PushError extends Error {
    statusCode?: number;
}
export const sendMedPushNotificationsLogic = async () => {
    const subscriptions = await PushSubscription.find();

    const reminders = await MedicationReminder.find()
        .populate<{ user: { timezone: string, _id: Types.ObjectId } }>({ path: "user", select: "timezone" })
        .populate<{ medication: { medication: string, dosage: string } }>({ path: "medication", select: "medication dosage" })
        .populate<{ pet: { name: string, user: Types.ObjectId } }>({ path: "pet", select: "name user" });

    const dueReminders = [];
    let sent = 0;

    for (const reminder of reminders) {
        const tz = reminder.user?.timezone || "UTC";
        const now = moment().tz(tz);
        const today = now.clone().startOf("day");

        let reminderUpdated = false;

        for (const [index, rt] of (reminder.reminder_times || []).entries()) {
            if (rt.is_given || rt.skipped) continue;

            // Prevent duplicate notifications same day
            if (rt.last_notified) {
                const lastNotifiedDay = moment(rt.last_notified)
                    .tz(tz)
                    .startOf("day");

                if (lastNotifiedDay.isSame(today)) continue;
            }

            const [hour, minute] = rt.time.split(":").map(Number);

            const reminderTimeToday = today.clone().set({
                hour,
                minute,
                second: 0,
                millisecond: 0
            });

            const remindBeforeMins = parseInt(rt.remind_before || "10", 10);
            const diffMinutes = reminderTimeToday.diff(now, "minutes");

            if (
                diffMinutes <= remindBeforeMins &&
                diffMinutes >= remindBeforeMins - 1
            ) {
                dueReminders.push({
                    reminder,
                    index,
                    pet: reminder.pet,
                    medication: reminder.medication || {},
                    reminderTime: rt.time,
                    minutesLeft: diffMinutes,
                });

                rt.last_notified = now.toDate();
                reminderUpdated = true;
            }
        }

        if (reminderUpdated) {
            await reminder.save();
        }
    }

    for (const due of dueReminders) {
        const { reminder, pet, medication, reminderTime, minutesLeft, index } = due;

        const userId =
            reminder.user?._id?.toString() || pet.user?.toString();

        const userSubs = subscriptions.filter(
            s => s.user?.toString() === userId
        );

        for (const sub of userSubs) {
            try {
                await webpush.sendNotification(
                    sub,
                    JSON.stringify({
                        title: `💊 ${medication.medication} Reminder`,
                        message: `🐾 ${pet.name}'s medication is due at ${reminderTime} (${minutesLeft} min left).`,
                        data: {
                            reminderId: reminder._id,
                            index
                        },
                        actions: [
                            { action: "mark-as-given", title: "Mark as Given" }
                        ]
                    })
                );
                sent++;
            } catch (err: unknown) {
                if (err instanceof Error) {
                    const error = err as PushError;
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await PushSubscription.deleteOne({
                            endpoint: sub.endpoint
                        });
                    }
                }
            }
        }
    }

    return sent;
};