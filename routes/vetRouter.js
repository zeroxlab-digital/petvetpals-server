import express from "express";
import { registerVet } from "../controllers/vetController.js";
import upload from "../middlewares/multer.js";
const vetRouter = express.Router();

vetRouter.post("/register", upload.single("image"), registerVet);

export default vetRouter;