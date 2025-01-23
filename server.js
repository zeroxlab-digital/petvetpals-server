import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import { configDotenv } from "dotenv";
import connectCloudinary from "./config/cloudinary.js";
import vetRouter from "./routes/vetRouter.js";
import userRouter from "./routes/userRouter.js";
import cookieParser from "cookie-parser";
import appointmentRouter from "./routes/appointmentRouter.js";
configDotenv();

// server config
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cookieParser());
const corsOption = {
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(cors(corsOption));

// routers
app.use("/api/vet", vetRouter);
app.use("/api/user", userRouter);
app.use("/api/appointment", appointmentRouter);

app.listen(PORT, () => {
    console.log(`The server is running on port: http://localhost:${PORT}`)
})