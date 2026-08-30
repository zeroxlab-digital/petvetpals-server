import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { configDotenv } from "dotenv";
import { PushSubscription } from "../models/pushSubscription.js";
import { LoginUserDTO, RegisterUserDTO, UpdateUserDTO, UserTimeZone } from "../types/user.types.js";
configDotenv();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 24 * 60 * 60 * 1000
} as const;

export const userRegister = async (req: Request<{}, {}, RegisterUserDTO>, res: Response) => {
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
        const newUser = await User.create({
            fullName,
            email,
            password: dashedPassword
        })
        const userDetails = await User.findOne({ email: newUser.email }).select("-password");
        if (!userDetails) {
            return res.status(500).json({ message: "Failed to retrive user!" });
        }
        const user_token = jwt.sign({ userId: userDetails._id }, process.env.JWT_SECRET_KEY!, { expiresIn: '60d' });
        res.status(200).cookie("user_token", user_token, cookieOptions).json({ success: true, message: "User registration successfull!", userDetails })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}

export const userLogin = async (req: Request<{}, {}, LoginUserDTO>, res: Response) => {
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
        const user_token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY!, { expiresIn: '60d' });
        res.status(200).cookie("user_token", user_token, cookieOptions).json({ success: true, message: "User login successfull!", userDetails })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(404).json({ message: "Credential is required" })
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ message: "Invalid token payload!" })
        }
        const { name, email, picture, sub: googleId } = payload as {
            name?: string;
            email?: string;
            picture: string;
            sub: string
        };

        if (!email) {
            return res.status(400).json({ message: "Google acount no email!" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            await User.create({
                fullName: name,
                email,
                image: picture,
                googleId
            })
        } else if (!user.googleId) {
            user.googleId = googleId,
                user.image = picture
            await user.save();
        }

        const userDetails = await User.findOne({ email }).select("-password");
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user_token = jwt.sign(
            { userId: userDetails._id },
            process.env.JWT_SECRET_KEY!,
            { expiresIn: "60d" }
        )

        res.status(200).cookie("user_token", user_token, cookieOptions).json({ success: true, message: "Google authentication successfull!", userDetails })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error!", error });
    }
}

export const userLogout = async (req: Request, res: Response) => {
    try {
        const userId = req.id; // now available via middleware

        if (userId) {
            await PushSubscription.updateMany(
                { user: userId },
                { $set: { user: null } }
            );
        }

        res.clearCookie("user_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.json({ success: true, message: "Logout successful!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const user = await User.findOne({ _id: userId }).select("-password -__v");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" })
        }
        res.status(200).json({ success: true, user })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

export const updateUserDetails = async (req: Request<{}, {}, UpdateUserDTO>, res: Response) => {
    try {
        const userId = req.id;
        const { fullName, image, gender, address, city, zip, state } = req.body;
        const updateUser = await User.findByIdAndUpdate({ _id: userId }, {
            fullName, image, gender, address, city, zip, state
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

export const updateUserTimezone = async (req: Request<{}, {}, UserTimeZone>, res: Response) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        const { timezone } = req.body;
        const updateUser = await User.findByIdAndUpdate({ _id: userId }, {
            timezone,
        }, { new: true, runValidators: true })
        res.status(200).json({ success: true, message: "User timezone updated!" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error while updating timezone", error });
    }
}