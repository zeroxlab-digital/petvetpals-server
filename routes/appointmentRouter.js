import express from "express";
import userAuthenticated from "../middlewares/userAuthenticated.js";
import { bookAppointment, deleteAppointment, viewAppointments } from "../controllers/appointmentController.js";
const appointmentRouter = express.Router();

// Vet appointment routers
appointmentRouter.get("/view-appointments", userAuthenticated, viewAppointments);
appointmentRouter.post("/book-appointment/:id", userAuthenticated, bookAppointment);
appointmentRouter.delete("/delete-appointment/:id", userAuthenticated, deleteAppointment)

export default appointmentRouter;