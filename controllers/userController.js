import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";

export const userRegister = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Confirm password doesn't match!" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const dashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullName,
            email,
            password: dashedPassword
        })
        res.status(200).json({ status: "success", message: "User created successfully!" });
    } catch (error) {
        console.log(error);
    }
}