import express from "express";
import userAuthenticated from "../middlewares/userAuthenticated.js";
import { bookAppointment, viewAppointments } from "../controllers/appointmentController.js";
const appointmentRouter = express.Router();

// Vet appointment routers
appointmentRouter.get("/view-appointments", userAuthenticated, viewAppointments);
appointmentRouter.post("/:id/book-appointment", userAuthenticated, bookAppointment);

export default appointmentRouter;