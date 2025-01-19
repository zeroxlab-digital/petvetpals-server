import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";

// server config
const app = express();
const PORT = 8000;

// middleware
configDotenv();
app.use(cors());
app.use(express.json());

// routers
app.get("/", (req, res) => {
    res.send("Hello world!");
})

app.listen(PORT, () => {
    console.log(`The server is running on port: http://localhost:${PORT}`)
})