import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface VetJWTPayload {
    vetId: string;
    vet_token: string;
}

const vetAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vet_token } = req.cookies;
        if (!vet_token) {
            return res.status(401).json({ message: "Vet not authenticated!" })
        }
        const decode_token = await jwt.verify(vet_token, process.env.JWT_SECRET_KEY) as VetJWTPayload;
        if (!vet_token) {
            return res.status(401).json({ message: "Invalid token!" })
        }
        req.id = decode_token.vetId;
        next();
    } catch (error: unknown) {
        next(error);
    }
}

export default vetAuthenticated;