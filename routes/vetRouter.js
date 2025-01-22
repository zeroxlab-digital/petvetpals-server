import express from "express";
import { getAllVets, getAppointment, getVet, loginVet, registerVet } from "../controllers/vetController.js";
import upload from "../middlewares/multer.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
const vetRouter = express.Router();

vetRouter.post("/register", upload.single("image"), registerVet);
vetRouter.post("/login", loginVet);
vetRouter.get("/", getAllVets);
vetRouter.get("/:id", getVet);
vetRouter.post("/:id/appointment", userAuthenticated, getAppointment);

export default vetRouter;