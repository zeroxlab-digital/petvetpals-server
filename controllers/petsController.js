import { Pet } from "../models/petModel.js";
import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "../config/cloudinary.js";
import { Medication, ScheduleReminder } from "../models/medicationsModel.js";
import { AllergyCondition, MedicalHistory, Vaccination } from "../models/healthRecordModel.js";
import moment from "moment-timezone";
import { SymptomReport } from "../models/symptom-checker/SymptomReport.js";
import { Appointment } from "../models/appointmentModel.js";
import calculateOverallHealth from "../utils/calculateOverallHealth.js";
connectCloudinary();

export const getDetailedPetData = async (req, res) => {
    try {
        const userId = req.id;
        const { id } = req.query;

        const pet = await Pet.findById(id).select("-user -__v");

        const overall_health = calculateOverallHealth(pet);
        console.log("Overall Pet Health:", overall_health)

        const upcoming_vaccination = await Vaccination.findOne({ pet: pet._id, next_due: { $gte: new Date() } }).sort({ next_due: 1 }).limit(1).select("vaccine next_due status notes");

        const recent_symptoms = await SymptomReport.find({ petId: pet._id }).sort({ createdAt: -1 }).limit(3).select("symptoms conditions");

        const now = new Date();
        const next_reminder = await ScheduleReminder.aggregate([
            { $match: { pet: pet._id } },
            { $unwind: "$reminder_times" },
            // Populate pet with specific fields
            {
                $lookup: {
                    from: "pets",
                    let: { petId: "$pet" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$petId"] } } },
                        { $project: { name: 1, type: 1 } } // name & species from pet
                    ],
                    as: "pet"
                }
            },
            { $unwind: "$pet" },
            // Populate medication with specific fields
            {
                $lookup: {
                    from: "medications",
                    let: { medicationId: "$medication" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$medicationId"] } } },
                        { $project: { medication: 1, dosage: 1 } } // name & dosage from medication
                    ],
                    as: "medication"
                }
            },
            { $unwind: "$medication" },

            // Step 1: Split time string "HH:mm" into hours and minutes
            {
                $addFields: {
                    reminder_hour: {
                        $toInt: { $arrayElemAt: [{ $split: ["$reminder_times.time", ":"] }, 0] }
                    },
                    reminder_minute: {
                        $toInt: { $arrayElemAt: [{ $split: ["$reminder_times.time", ":"] }, 1] }
                    }
                }
            },

            // Step 2: Build datetime using today's date and reminder time
            {
                $addFields: {
                    reminder_datetime_today: {
                        $dateFromParts: {
                            year: { $year: now },
                            month: { $month: now },
                            day: { $dayOfMonth: now },
                            hour: "$reminder_hour",
                            minute: "$reminder_minute"
                        }
                    }
                }
            },

            // Step 3: If reminder time is earlier than now, use tomorrow instead
            {
                $addFields: {
                    reminder_datetime: {
                        $cond: [
                            { $lte: ["$reminder_datetime_today", now] },
                            {
                                $dateAdd: {
                                    startDate: "$reminder_datetime_today",
                                    unit: "day",
                                    amount: 1
                                }
                            },
                            "$reminder_datetime_today"
                        ]
                    }
                }
            },

            // Step 4: Sort by closest reminder_datetime
            { $sort: { reminder_datetime: 1 } },

            // Step 5: Limit to the next upcoming one
            { $limit: 1 },
        ]);

        // Not based on Pet itself but the user
        const confirmed_appointment = await Appointment.findOne({ user: userId, status: 'confirmed' })
            .populate({ path: 'vet', select: "fullName" })
            .populate({ path: 'pet', select: "type name age" })
            .sort({ date: 1 })
            .limit(1);

        const pending_appointments = await Appointment.find({ user: userId, status: 'pending' })
            .sort({ date: 1 });

        res.status(200).json({ upcoming_vaccination, recent_symptoms, confirmed_appointment, pending_appointments, next_reminder, overall_health });
    } catch (error) {
        console.log(error);
        res.status(500).json({ succcess: false, message: "Inernal server error", error });
    }
}

export const getPetProfiles = async (req, res) => {
    try {
        const userId = req.id;
        const pets = await Pet.find({ user: userId }).select("-__v");
        res.status(200).json({ success: true, pets });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const addPetProfile = async (req, res) => {
    try {
        const user = req.id;
        const { type, name, age, gender, weight, breed } = req.body;
        if (!type || !name || !age || !gender) {
            return res.status(400).json({ message: "Pet type, name, age and gender is required!" })
        }

        let imageUrl = "";
        // Checks if an image was uploaded
        if (req.file) {
            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "pet_profiles", format: "jpg" },
                    (error, uploadedFile) => {
                        if (error) reject(error);
                        else resolve(uploadedFile.secure_url);
                    }
                ).end(req.file.buffer);
            });

            imageUrl = result;
        }

        const petProfile = await Pet.create({
            user, type, name, age, image: imageUrl, gender, breed,
            weight: [
                {
                    value: weight
                }
            ]
        })
        res.status(200).json({ success: true, message: "New pet profile added!", petProfile })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const updatePetProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, name, age, gender, weight, breed } = req.body;

        let imageUrl = "";
        if (req.file) {
            // If a file was included while requesting api then upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "pet_profiles", format: "jpg" },
                    (error, uploadedFile) => {
                        if (error) reject(error)
                        else resolve(uploadedFile.secure_url);
                    }
                ).end(req.file.buffer)
            });

            imageUrl = result;
        }

        const updatePet = await Pet.findByIdAndUpdate(id, {
            type, name, age, image: imageUrl, gender, breed,
            $push: {
                weight:
                {
                    value: weight
                }
            }
        }, {
            new: true,
            runValidators: true
        })
        if (!updatePet) {
            return res.status(400).json({ success: false, message: "Updating vet failed!" })
        }
        res.status(200).json({ success: true, message: "Vet was updated successfully!" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

// Pet Medications
export const addMedication = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const { medication, dosage, frequency, remaining, start_date, end_date, is_ongoing, reason, timeOfDay, prescribed_by, instructions, } = req.body;

        if (!medication || !frequency || !start_date) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newMedication = await Medication.create({
            pet: petId,
            medication,
            dosage,
            frequency,
            time_of_day: timeOfDay,
            remaining,
            start_date,
            end_date,
            is_ongoing,
            reason,
            prescribed_by,
            instructions
        })
        console.log("new medication:", newMedication)
        res.status(201).json({ success: true, message: "Medication added successfully!", newMedication });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const getMedications = async (req, res) => {
    try {
        const { petId } = req.query;
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized access!" });
        }
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }

        let medications = await Medication.find({ pet: petId })
            .populate("pet", "name type age")
            .select("-__v");

        // Update ongoing status if end_date passed
        const today = new Date();
        const updateMedicationsStatus = medications.filter(
            med => med.end_date && med.end_date < today && med.is_ongoing
        );
        if (updateMedicationsStatus.length) {
            await Medication.updateMany(
                { _id: { $in: updateMedicationsStatus.map(med => med._id) } },
                { is_ongoing: false }
            );
        }

        // Calculate next_due dynamically
        medications = medications.map(med => {
            if (med.is_ongoing) {
                const start = new Date(med.start_date);
                let next_due = null;

                if (med.frequency.toLowerCase() === "daily") {
                    next_due = new Date(today);
                    next_due.setDate(today.getDate() + 1); // + 1 should be added after fixing timezone issues
                } else if (med.frequency.toLowerCase() === "twice-daily") {
                    next_due = new Date(today);
                    next_due.setHours(today.getHours() + 12);
                } else if (med.frequency.toLowerCase() === "weekly") {
                    next_due = new Date(today);
                    next_due.setDate(today.getDate() + 7); // + 7 should be added after fixing timezone issues
                }
                // fallback: just use start_date
                else {
                    next_due = start;
                }

                // Attach it without saving to DB
                med = med.toObject();
                med.next_due = next_due;
            }
            return med;
        });

        // console.log("today:", today);
        // const medicationReminders = await ScheduleReminder.find().populate("medication").populate("pet");
        // const filteredReminders = medicationReminders.filter(reminder => reminder.user || reminder.pet.user.toString() === userId);
        // await ScheduleReminder.deleteMany({
        //     _id: { $nin: filteredReminders.map(i => i._id) },
        //     end_date: { $lte: today }
        // });
        // console.log("Medication reminders:", filteredReminders);

        res.status(200).json({ success: true, medications });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

export const deleteMedication = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const deleted_medication = await Medication.findOneAndDelete({ _id: id });
        if (!deleted_medication) {
            return res.status(400).json({ success: false, message: "Medication could not be deleted!" });
        }
        res.status(200).json({ success: true, message: "Medication deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const updateMedication = async (req, res) => {
    try {
        const { id } = req.query;
        const { medication, dosage, frequency, end_date, prescribed_by } = req.body;

        const updatedMedication = await Medication.findByIdAndUpdate(id, {
            medication,
            dosage,
            frequency,
            end_date,
            prescribed_by
        }, {
            new: true,
            runValidators: true
        });
        if (!updatedMedication) {
            return res.status(400).json({ success: false, message: "Updating medication failed!" });
        }
        res.status(200).json({ success: true, message: "Medication updated successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
// Medication Reminder
export const addMedReminder = async (req, res) => {
    try {
        const userId = req.id;
        const { petId } = req.query;
        const {
            medId,
            frequency,
            starting_date,
            end_date,
            reminder_times,
            reminder_methods,
            repeat_reminder
        } = req.body;

        if (!petId || !medId || !frequency || !reminder_times?.length) {
            return res.status(400).json({ success: false, message: "Required fields are missing!" });
        }

        const newScheduleReminder = await ScheduleReminder.create({
            user: userId,
            pet: petId,
            medication: medId,
            frequency,
            starting_date,
            end_date,
            reminder_times,
            reminder_methods,
            repeat_reminder
        });

        res.status(201).json({ success: true, newScheduleReminder });
    } catch (error) {
        console.error("Error creating reminder:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
export const updateMedReminder = async (req, res) => {
    try {
        const { id } = req.query;
        const {
            medId,
            frequency,
            starting_date,
            end_date,
            reminder_times,
            reminder_methods,
            repeat_reminder
        } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Schedule ID is required!" });
        }

        const updatedScheduleReminder = await ScheduleReminder.findByIdAndUpdate(
            id,
            {
                medication: medId,
                frequency,
                starting_date,
                end_date,
                reminder_times,
                reminder_methods,
                repeat_reminder
            },
            { new: true }
        );

        res.status(200).json({ success: true, updatedScheduleReminder });
    } catch (error) {
        console.error("Error updating reminder:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
export const getMedReminders = async (req, res) => {
    try {
        const userId = req.id;
        const { petId } = req.query;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized access!" });
        }
        if (!petId) {
            return res.status(404).json({ success: false, message: "Pet ID is required!" })
        }
        const scheduledReminders = await ScheduleReminder.find({ pet: petId }).populate("medication").populate("pet").select("-__v");
        const filteredReminders = scheduledReminders.filter(reminder => reminder.user || reminder.pet.user.toString() === userId);
        // Deletes any reminders that have passed their end date or is not ongoing anymore
        const today = new Date();
        const deleteReminders = filteredReminders.filter(item => item.end_date < today || item.medication.is_ongoing === false);
        await ScheduleReminder.deleteMany({ _id: { $in: deleteReminders.map(r => r._id) } });

        // console.log("scheduled reminders:", filteredReminders[0].reminder_times)

        res.status(200).json({ success: true, scheduledReminders: filteredReminders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const deleteMedReminder = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: "Scheduled Reminder ID is required!" })
        }
        await ScheduleReminder.findOneAndDelete({ _id: id });
        res.status(200).json({ success: true, message: "Scheduled reminder deleted successfully!" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const markGivenMedReminder = async (req, res) => {
    try {
        const userId = req.id;
        const id = req.body?.id || req.query?.id;
        const index = req.body?.index ?? req.query?.index;
        // console.log("ID & Index::", id, index);

        if (!userId) return res.status(401).json({ message: "Unauthorized access!" });
        if (!id || index === undefined) {
            return res.status(400).json({ success: false, message: "Reminder ID and time index are required." });
        }

        const result = await ScheduleReminder.updateOne(
            { _id: id },
            {
                $set: {
                    [`reminder_times.${index}.is_given`]: true,
                    [`reminder_times.${index}.last_reset`]: new Date()
                }
            }
        );

        if (result.matchedCount === 0)
            return res.status(404).json({ success: false, message: "Reminder not found or not yours." });

        res.status(200).json({ success: true, message: "Reminder marked as given." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

export const resetMedReminders = async (req, res) => {
    try {
        const now = moment();
        const reminders = await ScheduleReminder.find();

        let resetCount = 0;

        for (const reminder of reminders) {
            if (reminder.end_date && moment(reminder.end_date).isBefore(now)) continue;

            let reminderUpdated = false;

            for (let i = 0; i < (reminder.reminder_times || []).length; i++) {
                const rt = reminder.reminder_times[i];
                const [hour, minute] = rt.time.split(':').map(Number);
                const reminderTimeToday = moment().set({ hour, minute, second: 0, millisecond: 0 });
                const lastReset = moment(rt.last_reset || reminder.starting_date);

                let shouldReset = false;

                switch (reminder.frequency) {
                    case 'once_daily':
                    case 'twice_daily':
                        shouldReset = now.diff(lastReset, 'days') >= 1 && now.isAfter(reminderTimeToday);
                        break;
                    case 'every_other_day':
                        shouldReset = now.diff(lastReset, 'days') >= 2 && now.isAfter(reminderTimeToday);
                        break;
                    case 'once_weekly':
                        shouldReset = now.diff(lastReset, 'days') >= 7 && now.isAfter(reminderTimeToday);
                        break;
                    case 'twice_weekly':
                        shouldReset = now.diff(lastReset, 'days') >= 3 && now.isAfter(reminderTimeToday);
                        break;
                    case 'once_monthly':
                        shouldReset = now.diff(lastReset, 'months') >= 1 && now.isAfter(reminderTimeToday);
                        break;
                }

                if (shouldReset && rt.is_given) {
                    reminder.reminder_times[i].is_given = false;
                    reminder.reminder_times[i].last_reset = now.toDate();
                    reminderUpdated = true;
                    resetCount++;
                }
            }

            if (reminderUpdated) await reminder.save();
        }

        return res.status(200).json({ success: true, message: `Reset ${resetCount} reminder times.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Reminder reset failed", error });
    }
};

export const checkMedReminderNotifications = async (req, res) => {
    try {
        const now = moment().tz("America/Chicago"); // ✅ timezone for consistency
        const reminders = await ScheduleReminder.find()
            .populate({ path: "medication", select: "medication dosage remaining instructions" })
            .populate({ path: "pet", select: "type name age gender breed" });

        const dueReminders = [];

        reminders.forEach(reminder => {
            (reminder.reminder_times || []).forEach((rt, index) => {
                if (rt.is_given || rt.skipped) return;

                const [hour, minute] = rt.time.split(":").map(Number);

                // Uses today's date instead of starting_date to avoid old timestamps
                const reminderTime = moment().tz("America/Chicago").set({
                    hour,
                    minute,
                    second: 0,
                    millisecond: 0
                });

                const remindBeforeMins = parseInt(rt.remind_before || "10");
                const diffMinutes = reminderTime.diff(now, "minutes");

                if (diffMinutes <= remindBeforeMins && diffMinutes >= remindBeforeMins - 1) {
                    dueReminders.push({
                        reminderId: reminder._id,
                        index,
                        pet: reminder.pet,
                        medication: reminder.medication || {},
                        reminderTime: rt.time
                    });
                }
            });
        });

        res.status(200).json({ success: true, dueReminders });
    } catch (error) {
        console.error("checkReminderNotifications error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Pet Health Record
// Medical History
export const addMedicalHistory = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const { type, diagnosis, treatment, vetOrClinic, date, file, description, notes } = req.body;

        if (!type) {
            return res.status(400).json({ message: "Type is required!" });
        }
        if (!type || !diagnosis) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const newMedicalHistory = await MedicalHistory.create({
            pet: petId,
            vetOrClinic,
            type,
            diagnosis: diagnosis || "None required",
            treatment,
            date,
            file,
            description,
            notes
        });
        console.log("Added new medical record:", newMedicalHistory)
        res.status(200).json({ success: true, message: "Health record added successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const getMedicalHistory = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const medicalHistory = await MedicalHistory.find({ pet: petId })
            .populate("pet", "name type age")
            .select("-__v");
        res.status(200).json({ success: true, medicalHistory });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const updateMedicalHistory = async (req, res) => {
    try {
        const { id } = req.query;
        console.log("Medical ID:", id)
        const { type, diagnosis, treatment, vetOrClinic, date, file, description, notes } = req.body;

        const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate({ _id: id }, {
            type,
            diagnosis,
            treatment,
            vetOrClinic,
            date,
            file,
            description,
            notes
        }, {
            new: true,
            runValidators: true
        });

        if (!updatedMedicalHistory) {
            return res.status(400).json({ success: false, message: "Updating medical history failed!" });
        }
        res.status(200).json({ success: true, message: "Medical history updated successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const deleteMedicalHistory = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Medical history ID is required!" });
        }
        const deletedMedicalHistory = await MedicalHistory.findOneAndDelete({ _id: id });
        if (!deletedMedicalHistory) {
            return res.status(400).json({ success: false, message: "Medical history could not be deleted!" });
        }
        res.status(200).json({ success: true, message: "Medical history deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

// Vaccinations
export const addVaccination = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const { vaccine, provider, date_given, next_due, status, notes } = req.body;
        if (!vaccine) {
            return res.status(400).json({ message: "Vaccine is required" });
        }
        const newVaccination = await Vaccination.create({
            pet: petId,
            vaccine,
            provider,
            date_given,
            next_due,
            status,
            notes
        });
        res.status(201).json({ success: true, message: "Vaccination added successfully!", newVaccination });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const getVaccinations = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const vaccinations = await Vaccination.find({ pet: petId })
            .populate("provider", "fullName")
            .populate("pet", "name type age")
            .select("-__v");
        res.status(200).json({ success: true, vaccinations });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const deleteVaccination = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Vaccination ID is required!" });
        }
        const deletedVaccination = await Vaccination.findOneAndDelete({ _id: id });
        if (!deletedVaccination) {
            return res.status(400).json({ success: false, message: "Vaccination could not be deleted!" });
        }
        res.status(200).json({ success: true, message: "Vaccination deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const updateVaccination = async (req, res) => {
    try {
        const { id } = req.query;
        const { vaccine, provider, date_given, next_due, status, notes } = req.body;

        const updatedVaccination = await Vaccination.findByIdAndUpdate(id, {
            vaccine,
            provider,
            date_given,
            next_due,
            status,
            notes
        }, {
            new: true,
            runValidators: true
        });
        if (!updatedVaccination) {
            return res.status(400).json({ success: false, message: "Updating vaccination failed!" });
        }
        res.status(200).json({ success: true, message: "Vaccination updated successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

// Allergy Conditions
export const addAllergyCondition = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const { type, name, severity, diagnosedDate, description } = req.body;
        if (!type || !name) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const newAllergyCondition = await AllergyCondition.create({
            pet: petId,
            type,
            name,
            severity,
            diagnosedDate,
            description
        });
        res.status(201).json({ success: true, message: "Allergy/condition added successfully!", newAllergyCondition });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const getAllergiesConditions = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const allergiesConditions = await AllergyCondition.find({ pet: petId })
            .populate("pet", "name type age")
            .select("-__v");
        res.status(200).json({ success: true, allergiesConditions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const deleteAllergyCondition = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Allergy condition ID is required!" });
        }
        const deletedAllergyCondition = await AllergyCondition.findOneAndDelete({ _id: id });
        if (!deletedAllergyCondition) {
            return res.status(400).json({ success: false, message: "Allergy condition could not be deleted!" });
        }
        res.status(200).json({ success: true, message: "Allergy condition deleted successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const updateAllergyCondition = async (req, res) => {
    try {
        const { id } = req.query;
        const { type, name, severity, diagnosedDate, description } = req.body;

        const updatedAllergyCondition = await AllergyCondition.findByIdAndUpdate(id, {
            type,
            name,
            severity,
            diagnosedDate,
            description
        }, {
            new: true,
            runValidators: true
        });
        if (!updatedAllergyCondition) {
            return res.status(400).json({ success: false, message: "Updating allergy condition failed!" });
        }
        res.status(200).json({ success: true, message: "Allergy condition updated successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}


// ---------- Pet Health Insights - Overall Health, Activity Level, Energy Level etc. ----------- //

export const logActivityLevel = async (req, res) => {
    try {
        const { id } = req.query;
        const { activity_level } = req.body;

        const updated_activity_level = await Pet.findByIdAndUpdate({ _id: id }, {
            $push: {
                activity_level: {
                    value: activity_level
                }
            }
        }, { new: true, runValidators: true }).select("activity_level -_id");

        res.status(200).json({ success: true, message: "Logged new activity level!", activity_level: updated_activity_level.activity_level })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error!", error })
    }
}

export const logEnergyLevel = async (req, res) => {
    try {
        const { id } = req.query;
        const { energy_level } = req.body;

        const updated_energy_level = await Pet.findByIdAndUpdate({ _id: id }, {
            $push: {
                energy_level: {
                    value: energy_level
                }
            }
        }, { new: true, runValidators: true }).select("energy_level -_id");

        res.status(200).json({ success: true, message: "Logged new energy level!", energy_level: updated_energy_level.energy_level })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error!", error })
    }
}