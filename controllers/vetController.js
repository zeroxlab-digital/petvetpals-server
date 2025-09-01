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
        res.status(400).json({ message: "Internal server error!", error });
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
        const vet_token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '60d' });
        res.status(200).cookie("vet_token", vet_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 60 * 24 * 60 * 60 * 1000
        }).json({ success: true, message: "Vet login successfull!" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}

export const getVetProfile = async (req, res) => {
    try {
        const vetId = req.id;
        const vet = await Vet.findById(vetId).select("-password -__v");
        res.status(200).json({ success: true, vet });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error })
    }
}

export const updateVetProfile = async (req, res) => {
    try {
        const vetId = req.id;
        const { fullName, fees, gender, image, banner, about, experience_years, experiences, degrees, specialities, works_at, languages, based_in } = req.body;;
        const updateVet = await Vet.findByIdAndUpdate({ _id: vetId }, {
            fullName,
            fees,
            gender,
            image,
            banner,
            about,
            experience_years,
            experiences,
            degrees,
            specialities,
            works_at,
            languages,
            based_in
        }, { new: true, runValidator: true })
        if (!updateVet) {
            res.status(400).json({ message: "Updating vet failed!", success: false })
        }
        res.status(200).json({ message: "Vet updated successfull!", success: true })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error while updating vet!", error })
    }
}

export const vetLogout = async (req, res) => {
    try {
        res.clearCookie("vet_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        });

        return res.json({ success: true, message: "Logout successful!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const vetId = req.id;
        console.log("Vet ID:", vetId)
        const appointments = await Appointment.find({
            vet: vetId,
            payment_status: true
        })
        .populate({ path: "user", select: "fullName email gender image city" })
        console.log("Appointments:", appointments);
        res.status(200).json({ success: true, appointments })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}


export const getAllVets = async (req, res) => {
    try {
        const vets = await Vet.find().select("-password -slots_booked -__v");
        res.status(200).json({ success: true, vets })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error while getting all vets!", error });
    }
}

export const getVet = async (req, res) => {
    const { id } = req.params;
    try {
        const vet = await Vet.findById(id).select("-password -slots_booked -__v");
        res.status(200).json(vet);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}
