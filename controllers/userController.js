import jwt from "jsonwebtoken";
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
        res.status(400).json({ message: "Internal server error!", error });
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }
        const userDetails = await User.findOne({ email }).select("-password");
        const user_token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        res.status(200).cookie("user_token", user_token, { maxAge: 1 * 24 * 60 * 60 * 1000, 
            // Comment this line below for in localhost run
            sameSite: "None", secure: process.env.NODE_ENV === "production"
        }).json({ success: 'true', message: "User login successfull!", userDetails })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}

export const userLogout = async (req, res) => {
    try {
        res.clearCookie("user_token", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "None"
        });

        return res.json({ success: true, message: "Logout successful!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findOne({ _id: userId }).select("-password -__v");
        res.status(200).json({ success: true, user })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

export const updateUserDetails = async (req, res) => {
    try {
        const userId = req.id;
        const { fullName, image, gender, address, city, zip } = req.body;
        const updateUser = await User.findByIdAndUpdate({ _id: userId }, {
            fullName, image, gender, address, city, zip,
        }, { new: true, runValidators: true }).select("-password")
        if (!updateUser) {
            return res.status(500).json({ success: false, message: "User profile could not be updated!" })
        }
        res.status(200).json({ success: true, message: "User profile update successfull!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}