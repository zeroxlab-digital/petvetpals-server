import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import { configDotenv } from "dotenv";
import connectCloudinary from "./config/cloudinary.js";
import vetRouter from "./routes/vetRouter.js";
import userRouter from "./routes/userRouter.js";
import cookieParser from "cookie-parser";
configDotenv();

// server config
const app = express();
const PORT = 8000;
connectDB();
connectCloudinary();

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routers
app.use("/api/vet", vetRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
    console.log(`The server is running on port: http://localhost:${PORT}`)
})