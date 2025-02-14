import bcrypt from "bcrypt";
import { Vet } from "../models/vetModel.js";
import jwt from "jsonwebtoken";

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
        const vet_token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        res.status(200).cookie("vet_token", vet_token, { maxAge: 1 * 24 * 60 * 60 * 1000, sameSite: 'strict', httpOnly: true }).json({ status: "success", message: "Login successfull!", vetData })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}

export const updateVetProfile = async (req, res) => {
    try {
        const vetId = req.id;
        const { id } = req.params;
        if (vetId !== id) {
            return res.status(400).json({ message: "Vet is not authenticated!" });
        }
        const { fullName, fees, gender, image, about, experience_years, experiences, degrees, specialities, works_at } = req.body;;
        const updateVet = await Vet.findByIdAndUpdate(id , {
            fullName,
            fees,
            gender,
            image,
            about,
            experience_years,
            experiences,
            degrees,
            specialities,
            works_at
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
