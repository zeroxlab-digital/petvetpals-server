import express from "express";
import { loginVet, registerVet } from "../controllers/vetController.js";
import upload from "../middlewares/multer.js";
const vetRouter = express.Router();

vetRouter.post("/register", upload.single("image"), registerVet);
vetRouter.post("/login", loginVet);

export default vetRouter;