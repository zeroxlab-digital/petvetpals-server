import { Appointment } from "../models/appointmentModel.js";
import { Vet } from "../models/vetModel.js";

export const bookAppointment = async (req, res) => {
    try {
        const userId = req.id;
        const vetId = req.params.id;
        const { date } = req.body;

        let vet = await Vet.findOne({ _id: vetId });

        const requestedDate = new Date(date);

        // Check if the date is already booked
        const availability = vet.slots_booked.filter(item => {
            const bookedDate = new Date(item.date);
            return bookedDate.getTime() === requestedDate.getTime();
        });

        if (availability.length > 0) {
            return res.status(404).json({ message: "Date not available!" });
        }

        // Create a new appointment
        const newAppointment = await Appointment.create({
            user: userId,
            vet: vetId,
            date: requestedDate
        });

        // Update the vet slots booked if new appointment takes place
        if (newAppointment) {
            vet.slots_booked.push({ date: requestedDate, appointmentId: newAppointment._id });
        }
        await vet.save();

        res.status(200).json({ message: "New Appointment booked", newAppointment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewAppointments = async (req, res) => {
    try {
        const userId = req.id;
        const appointments = await Appointment.find({
            user: userId,
        }).populate({ path: 'vet user', select: "-password -slots_booked" });
        res.status(200).json({ success: true, appointments })
    } catch(error) {
        console.log(userId)
        res.status(200).json({ message: "Internal server error!" })
    }
}