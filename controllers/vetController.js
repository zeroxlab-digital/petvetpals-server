import bcrypt from "bcrypt";
import { Vet } from "../models/vetModel.js";
import jwt from "jsonwebtoken";
import { Appointment } from "../models/appointmentModel.js";

export const registerVet = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        if (!fullName, !email, !password, !confirmPassword) {
            return res.status(400).json({ message: "All fields are required!" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Confirm password doesn't match!" })
        }
        const vetUser = await Vet.findOne({ email })
        if (vetUser) {
            return res.status(400).json({ message: "User already exists!" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await Vet.create({
            fullName,
            email,
            password: hashedPassword
        })
        res.status(200).json({ message: "User registration successfull!" })
    } catch (error) {
        console.log(error)
    }
}

export const loginVet = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vet = await Vet.findOne({ email });
        if (!vet) {
            return res.status(400).json({ message: "User doesn't exist!" })
        }
        const vetData = await Vet.findOne({ email }).select("-password");
        const vetPasswordMatch = await bcrypt.compare(password, vet.password);
        if (!vetPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }
        const tokenData = {
            vetId: vet._id
        }
        const vet_token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        res.status(200).cookie("vet_token", vet_token, { maxAge: 1 * 24 * 60 * 60 * 1000, sameSite: 'strict', httpOnly: true }).json({ status: "success", message: "Login successfull!", vetData })
    } catch (error) {
        console.log(error);
    }
}

export const getAllVets = async (req, res) => {
    try {
        const vets = await Vet.find();
        res.status(200).json({ success: true, vets })
    } catch (error) {
        console.log(error);
    }
}

export const getVet = async (req, res) => {
    const { id } = req.params;
    try {
        const vet = await Vet.findById(id);
        res.status(200).json(vet);
    } catch (error) {
        console.log(error);
    }
}

export const getAppointment = async (req, res) => {
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
