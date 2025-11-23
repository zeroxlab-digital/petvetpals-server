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
import nutritionistRouter from "../routes/nutritionist/nutritionistRoutes.js";
import allergyCoachRouter from "../routes/allergy-itch-coach/allergyCoachRoutes.js";
import cron from "node-cron";
import pushRouter from "../routes/pushRouter.js";
import { sendMedPushNotificationsLogic, sendPushNotificationsLogic } from "../controllers/pushController.js";
import reminderRouter from "../routes/reminder/reminderRoutes.js";
import { resetMedReminders } from "../controllers/petsController.js";
import { resetReminders } from "../controllers/reminder/reminderController.js";
configDotenv();

// server config
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cookieParser());

// List of hostnames allowed for CORS
const allowedHostnames = [
    'localhost',                  // for dev
    'petvetpals.com',             // production
    'www.petvetpals.com',         // production with www
    'petvetpals.vercel.app',      // Vercel deployment
];

// CORS options
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            // This will allow requests with no origin (Postman, curl, server-to-server)
            return callback(null, true);
        }

        try {
            const url = new URL(origin);
            if (allowedHostnames.includes(url.hostname)) {
                return callback(null, true);
            } else {
                console.log('Blocked by CORS:', origin);
                return callback(new Error('Not allowed by CORS'));
            }
        } catch (err) {
            console.log('Invalid origin:', origin);
            return callback(new Error('Invalid origin'));
        }
    },
    credentials: true, // allow cookies/auth headers
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// CRON job running every 1 minute to send push notifications
cron.schedule("*/1 * * * *", async () => {
    console.log("Running reminder push task...");
    try {
        const med_reminder_sent = await sendMedPushNotificationsLogic();
        console.log(`Sent ${med_reminder_sent} med push notifications.`);
        const reminder_sent = await sendPushNotificationsLogic();
        console.log(`Sent ${reminder_sent} general push notifications.`);
    } catch (err) {
        console.error("Cron push error:", err);
    }
});

// CRON job to reset med reminders
// Runs every 10 minute
cron.schedule("*/10 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running reminder reset job...`);
    try {
        await resetReminders(
            { method: 'GET' },
            {
                status: (code) => ({
                    json: (data) => console.log(`Reminders reset job response (${code}):`, data)
                })
            }
        );
        await resetMedReminders(
            { method: 'GET' },
            {
                status: (code) => ({
                    json: (data) => console.log(`Med reminders reset job response (${code}):`, data)
                })
            }
        );
        console.log("Both reminder reset jobs completed.")
    } catch (err) {
        console.error("Error running reminder reset job:", err);
    }
});


// ROUTES
app.get("/", (req, res) => {
    res.send("Hello pawsome people, welcome to PetVetPals!")
})

app.use("/api/vet", vetRouter);
app.use("/api/user", userRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/pet", petRouter);

// Symptom router
app.use("/api/symptoms", symptomRouter);
// Nutritionist router
app.use("/api/nutritionist", nutritionistRouter);
// Allergy and Itch Coach router
app.use("/api/allergy-itch-coach", allergyCoachRouter);

// Reminder router
app.use("/api/reminder", reminderRouter);

// Push notification router
app.use("/api/push", pushRouter);

// Messenger between pet owner and vet
app.use("/api/message", messageRouter);

app.listen(PORT, () => {
    console.log(`The server is running on port: http://localhost:${PORT}`)
})

export default app;
export const handler = serverless(app);