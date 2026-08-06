import { NextFunction, Request, Response } from "express";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if(err instanceof Error) {
        console.error(err);

        return res.status(500).json({ success: false, message: err.message })
    }

    console.error(err);

    return res.status(500).json({ success: false, message: "Internal server error" });
}