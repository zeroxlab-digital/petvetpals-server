import { NextFunction, Request, Response } from "express";
import { sendMedPushNotificationsLogic } from "../../controllers/pushController.js";

export default async function handler(req: Request, res: Response, next: NextFunction) {
  // at first verify secret key before running anything
  const providedKey = req.query.key || req.headers["x-cron-secret"];
  if (providedKey !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, error: "Unauthorized" });
  }

  console.log("🕐 Running reminder push task...");
  try {
    const medCount = await sendMedPushNotificationsLogic();
    console.log(`Sent ${medCount} medication notifications`);

    return res.status(200).json({
      success: true,
      message: `Sent ${medCount} med notifications.`,
    });
  } catch (error: unknown) {
    next(error);
  }
}
