import express from "express";
import userAuthenticated from "../middlewares/userAuthenticated.js";
import { bookAppointment, deleteAppointment, updateAppointment, viewAppointments } from "../controllers/appointmentController.js";
const appointmentRouter = express.Router();

// Vet appointment routers
appointmentRouter.get("/view-appointments", userAuthenticated, viewAppointments);
appointmentRouter.post("/book-appointment/:id", userAuthenticated, bookAppointment);
appointmentRouter.patch("/update-appointment/:id", userAuthenticated, updateAppointment);
appointmentRouter.delete("/delete-appointment/:id", userAuthenticated, deleteAppointment)

export default appointmentRouter;