import express from "express";
import { getAllVets, loginVet, registerVet } from "../controllers/vetController.js";
import upload from "../middlewares/multer.js";
const vetRouter = express.Router();

vetRouter.post("/register", upload.single("image"), registerVet);
vetRouter.post("/login", loginVet);
vetRouter.get("/allvets", getAllVets);

export default vetRouter;