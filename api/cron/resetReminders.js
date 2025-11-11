import { resetMedReminders } from "../../controllers/petsController.js";
import { resetReminders } from "../../controllers/reminder/reminderController.js";

export default async function handler(req, res) {
  // at first verify secret key before running anything
  const providedKey = req.query.key || req.headers["x-cron-secret"];
  if (providedKey !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, error: "Unauthorized" });
  }

  console.log(`[${new Date().toISOString()}] Running reminder reset job...`);
  try {
    await resetReminders({ method: "GET" }, {
      status: (code) => ({ json: (data) => console.log(`resetReminders (${code}):`, data) })
    });

    await resetMedReminders({ method: "GET" }, {
      status: (code) => ({ json: (data) => console.log(`resetMedReminders (${code}):`, data) })
    });

    return res.status(200).json({ success: true, message: "Both reset jobs completed" });
  } catch (error) {
    console.error("Error running reminder reset job:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
