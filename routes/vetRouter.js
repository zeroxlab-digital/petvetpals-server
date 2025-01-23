import express from "express";
import { getAllVets, getVet, loginVet, registerVet } from "../controllers/vetController.js";
const vetRouter = express.Router();

// Vet appointment routers
// vetRouter.get("/view-appointments", userAuthenticated, viewAppointments);
// vetRouter.post("/:id/appointment", userAuthenticated, bookAppointment);

// vet registration and login routers
vetRouter.post("/register", registerVet);
vetRouter.post("/login", loginVet);

// vet related routers
vetRouter.get("/all-vets", getAllVets);
vetRouter.get("/all-vets/:id", getVet);

export default vetRouter;