import bcrypt from "bcrypt";
import { Vet } from "../models/vetModel.js";

export const registerVet = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        if(!fullName, !email, !password, !confirmPassword) {
            return res.status(400).json({message: "All fields are required!"})
        }
        if(password !== confirmPassword) {
            return res.status(400).json({message: "Confirm password doesn't match!"})
        }
        const vetUser = await Vet.findOne({ email })
        if(vetUser) {
            return res.status(400).json({message: "User already exists!"})
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