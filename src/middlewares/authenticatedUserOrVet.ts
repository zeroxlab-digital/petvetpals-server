import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserJWTPayload } from "./userAuthenticated.js";
import { VetJWTPayload } from "./vetAuthenticated.js";

const authenticatedUserOrVet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_token, vet_token } = req.cookies;
        if (user_token) {
            const decoded_token = await jwt.verify(user_token, process.env.JWT_SECRET_KEY) as UserJWTPayload;
            if (!decoded_token) {
                return res.status(400).json({ message: "User token is invalid!" })
            }
            req.id = decoded_token.userId;
            req.role = "user";
            return next();
        }
        if (vet_token) {
            const decoded_token = jwt.verify(vet_token, process.env.JWT_SECRET_KEY) as VetJWTPayload;
            if (!decoded_token) {
                return res.status(400).json({ message: "Vet token is invalid!" })
            }
            req.id = decoded_token.vetId;
            req.role = "vet";
            return next();
        }
        return res.status(401).json({ message: "Authentication required!" });
    } catch (error: unknown) {
        next(error);
    }
}

export default authenticatedUserOrVet;