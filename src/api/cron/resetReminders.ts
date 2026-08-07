import { Request, Response, NextFunction } from "express";
import { resetMedReminders } from "../../controllers/petsController.js";
// import { resetReminders } from "../../controllers/reminder/reminderController.js";

export default async function handler(req: Request, res: Response, next: NextFunction) {
  // at first verify secret key before running anything
  const providedKey = req.query.key || req.headers["x-cron-secret"];
  if (providedKey !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, error: "Unauthorized" });
  }

  console.log(`[${new Date().toISOString()}] Running reminder reset job...`);
  try {
    // await resetReminders({ method: "GET" }, {
    //   status: (code) => ({ json: (data) => console.log(`resetReminders (${code}):`, data) })
    // });

    await resetMedReminders(
      { method: "GET" } as any,
      {
        status: (code: number) => ({ json: (data: unknown) => console.log(`resetMedReminders (${code}):`, data) })
      } as any,
      () => { }
    );

    return res.status(200).json({ success: true, message: "Both reset jobs completed" });
  } catch (error: unknown) {
    next(error);
  }
}
