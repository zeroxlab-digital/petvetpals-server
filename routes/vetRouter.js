import express from "express";
import { getAllVets, getAppointment, getVet, loginVet, registerVet, viewAppointments } from "../controllers/vetController.js";
import upload from "../middlewares/multer.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
const vetRouter = express.Router();

// Vet appointment routers
vetRouter.get("/appointments", userAuthenticated, viewAppointments);
vetRouter.post("/:id/appointment", userAuthenticated, getAppointment);

// vet registration and login routers
vetRouter.post("/register", upload.single("image"), registerVet);
vetRouter.post("/login", loginVet);

// get vet related routers
vetRouter.get("/", getAllVets);
vetRouter.get("/:id", getVet);

export default vetRouter;