import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface UserJWTPayload {
    userId: string;
    user_token: string;
}

const userAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_token } = req.cookies;
        if (!user_token) {
            return res.status(400).json({ message: "User not authenticated!" })
        }
        const decoded = await jwt.verify(user_token, process.env.JWT_SECRET_KEY) as UserJWTPayload;
        if (!decoded) {
            return res.status(400).json({ message: "Token invalid!" })
        }
        req.id = decoded.userId;
        next()
    } catch (error: unknown) {
        next(error);
    }
}

export default userAuthenticated;