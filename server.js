import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import { configDotenv } from "dotenv";
import connectCloudinary from "./config/cloudinary.js";
configDotenv();

// server config
const app = express();
const PORT = 8000;
connectDB();
connectCloudinary();

// middleware
app.use(cors());
app.use(express.json());

// routers
app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(PORT, () => {
    console.log(`The server is running on port: http://localhost:${PORT}`)
})