import { NextFunction, Request, Response } from "express";
import { Appointment } from "../models/appointmentModel.js";
import { Vet } from "../models/vetModel.js";
import { BookAppointmentDTO, SlotBookDTO, UpdateAppointmentDTO } from "../types/appointment.types.js";

export const bookAppointment = async (req: Request<{ id: string }, {}, BookAppointmentDTO>, res: Response, next: NextFunction) => {
    try {
        const userId = req.id;
        const vetId = req.params.id;
        const { date } = req.body;

        let vet = await Vet.findOne({ _id: vetId });
        if(!vet) {
            return res.status(500).json({ success: false, message: "Vet not found"})
        }
        
        const requestedDate = new Date(date);

        // Check if the date is already booked
        const availability = vet.slots_booked.filter((item: SlotBookDTO) => {
            const bookedDate = new Date(item.date);
            return bookedDate.getTime() === requestedDate.getTime();
        });

        if (availability.length > 0) {
            return res.status(400).json({ message: "Date not available!" });
        }

        // Create a new appointment
        const newAppointment = await Appointment.create({
            user: userId,
            vet: vetId,
            date: requestedDate,
            status: "pending"
        });

        // Update the vet slots booked if new appointment takes place
        if (newAppointment) {
            vet.slots_booked.push({ date: requestedDate, appointmentId: newAppointment._id });
        }
        await vet.save();

        res.status(200).json({ message: "New Appointment booked", newAppointment });
    } catch (error: unknown) {
        next(error)
    }
};

export const updateAppointment = async (req: Request<{ id: string }, {}, UpdateAppointmentDTO>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { pet, purpose, payment_status, status, date } = req.body;
        const updateAppt = await Appointment.findByIdAndUpdate({ _id: id }, {
            pet, purpose, payment_status, status, date
        }, { new: true, runValidators: true });
        if (!updateAppt) {
            return res.status(400).json({ success: false, message: "Could not update the appointment!" });
        }
        res.status(200).json({ success: true, message: "Appointment updated successfully!", updateAppt });
    } catch (error: unknown) {
        next(error)
    }
}

export const viewAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.id;
        const appointments = await Appointment.find({
            user: userId,
        })
        .populate({ path: 'vet', select: "-password -slots_booked -createdAt -updatedAt -__v" })
        .populate({ path: 'pet', select: "-user -createdAt -updatedAt -__v"});
        console.log("appointments:", appointments)
        res.status(200).json({ success: true, appointments })
    } catch (error: unknown) {
        next(error)
    }
}

export const deleteAppointment = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deleteAppt = await Appointment.findOneAndDelete({ _id: id });
        if (!deleteAppt) {
            return res.status(400).json({ success: false, message: "Appointment could not be deleted!" })
        }
        res.status(200).json({ success: true, message: "Appointment deleted successfully!" })
    } catch (error: unknown) {
        next(error)
    }
}