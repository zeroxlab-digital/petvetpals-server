import express from "express";
import { bookAppointment, getAllVets, getVet, loginVet, registerVet, viewAppointments } from "../controllers/vetController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
const vetRouter = express.Router();

// Vet appointment routers
vetRouter.get("/view-appointments", userAuthenticated, viewAppointments);
vetRouter.post("/:id/appointment", userAuthenticated, bookAppointment);

// vet registration and login routers
vetRouter.post("/register", registerVet);
vetRouter.post("/login", loginVet);

// vet related routers
vetRouter.get("/all-vets", getAllVets);
vetRouter.get("/all-vets/:id", getVet);

export default vetRouter;