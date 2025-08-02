import express from "express";
import cors from "cors";
import connectDB from "../config/mongodb.js";
import { configDotenv } from "dotenv";
import connectCloudinary from "../config/cloudinary.js";
import vetRouter from "../routes/vetRouter.js";
import userRouter from "../routes/userRouter.js";
import cookieParser from "cookie-parser";
import appointmentRouter from "../routes/appointmentRouter.js";
import petRouter from "../routes/petRouter.js";
import messageRouter from "../routes/messenger/messeageRoute.js";
import serverless from "serverless-http";
import symptomRouter from "../routes/symptom-checker/symptomRoutes.js";
import cron from "node-cron";
import axios from "axios";
import { ScheduleReminder } from "../models/medicationsModel.js";
import moment from "moment";
import pushRouter from "../routes/pushRouter.js";
import { sendPushNotificationsLogic } from "../controllers/pushController.js";
configDotenv();

// server config
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000', 'https://petvetpals.vercel.app'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));

// CRON JOB
// cron.schedule('*/15 * * * *', async () => {
//     try {
//         await axios.get(`${process.env.API_BASE}/api/pet/medications/reset-medication-reminders`);
//         console.log("⏱️ Reminder reset triggered.");
//     } catch (err) {
//         console.error("❌ Reminder reset failed:", err);
//     }
// });
cron.schedule('* * * * *', async () => {
    const now = moment();

    const reminders = await ScheduleReminder.find({}); // maybe narrow scope later

    for (const reminder of reminders) {
        for (let i = 0; i < reminder.reminder_times.length; i++) {
            const rt = reminder.reminder_times[i];
            if (rt.is_given) continue;

            const [hour, minute] = rt.time.split(':').map(Number);
            const reminderMoment = moment(reminder.starting_date).set({ hour, minute });

            const notifyAt = moment(reminderMoment).subtract(Number(rt.remind_before), 'minutes');

            // Only notify within ±30 seconds to avoid duplicates
            if (now.isBetween(notifyAt.clone().subtract(30, 'seconds'), notifyAt.clone().add(30, 'seconds'))) {
                // 🚨 Trigger Notification
                console.log(`Notify user for Reminder ID ${reminder._id} time ${rt.time}`);

                // You can store a record or push to a socket/in-app queue
                // OR integrate with push (next step)
            }
        }
    }
});
cron.schedule("*/1 * * * *", async () => {
    console.log("Running reminder push task...");
    try {
        const sent = await sendPushNotificationsLogic();
        console.log(`Sent ${sent} push notifications.`);
    } catch (err) {
        console.error("Cron push error:", err);
    }
});


// routers
app.get("/", (req, res) => {
    res.send("Hello world, welcome to PetVetPals!")
})
app.use("/api/vet", vetRouter);
app.use("/api/user", userRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/pet", petRouter);
// Symptom router
app.use("/api/symptoms", symptomRouter)

// Routes for the messenger between pet owner and vet :)
app.use("/api/message", messageRouter);

app.use("/api/push", pushRouter);

app.listen(PORT, () => {
    console.log(`The server is running on port: http://localhost:${PORT}`)
})

export default app;
export const handler = serverless(app);