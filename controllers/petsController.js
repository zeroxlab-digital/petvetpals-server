import { Pet } from "../models/petModel.js";
import { v2 as cloudinary } from "cloudinary";
import connectCloudinary from "../config/cloudinary.js"; // Import the config function to upload file
import { Medication, ScheduleReminder } from "../models/medicationsModel.js";
import { AllergyCondition, MedicalHistory, Vaccination } from "../models/healthRecordModel.js";
import moment from "moment";

connectCloudinary(); // Calls the function to configure Cloudinary as uploading from this file


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
            user, type, name, age, image: imageUrl, gender, weight, breed
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
            type, name, age, image: imageUrl, gender, weight, breed
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
        const { medication, dosage, frequency, remaining, start_date, end_date, next_due, is_ongoing, reason, timeOfDay, prescribed_by, instructions, } = req.body;

        if (!medication || !dosage || !frequency || !start_date) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const newMedication = await Medication.create({
            pet: petId,
            medication,
            dosage,
            frequency,
            time_of_day: timeOfDay,
            remaining,
            next_due,
            start_date,
            end_date,
            is_ongoing,
            reason,
            prescribed_by,
            instructions
        })
        res.status(201).json({ success: true, message: "Medication added successfully!", newMedication });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const getMedications = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required!" });
        }
        const medications = await Medication.find({ pet: petId }).populate("prescribed_by", "fullName").populate("pet", "name type age").select("-__v");
        res.status(200).json({ success: true, medications });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

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
        const { medication, dosage, frequency, is_ongoing, prescribed_by } = req.body;

        const updatedMedication = await Medication.findByIdAndUpdate(id, {
            medication,
            dosage,
            frequency,
            is_ongoing,
            end_date: is_ongoing ? null : new Date(),
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
// Medication Schedule Reminder
export const addMedScheduleReminder = async (req, res) => {
    try {
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
export const updateMedScheduledReminder = async (req, res) => {
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
export const getMedScheduledReminders = async (req, res) => {
    try {
        const { petId } = req.query;
        if (!petId) {
            return res.status(404).json({ success: false, message: "Pet ID is required!" })
        }
        const scheduledReminders = await ScheduleReminder.find({ pet: petId }).populate("medication").select("-__v")
        res.status(200).json({ success: true, scheduledReminders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const deleteMedScheduledReminder = async (req, res) => {
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
export const markGivenMedScheduledReminder = async (req, res) => {
    try {
        const { id, index } = req.query;

        if (!id || index === undefined) {
            return res.status(400).json({ success: false, message: "Reminder ID and time index are required." });
        }

        const reminder = await ScheduleReminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ success: false, message: "Reminder not found." });
        }

        reminder.reminder_times[index].is_given = true;
        await reminder.save();

        res.status(200).json({ success: true, message: "Reminder marked as given." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const resetMedicationReminders = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const now = moment();
        const reminders = await ScheduleReminder.find();

        let resetCount = 0;

        for (const reminder of reminders) {
            let reminderUpdated = false;

            for (let i = 0; i < (reminder.reminder_times || []).length; i++) {
                const rt = reminder.reminder_times[i];
                const [hour, minute] = rt.time.split(':').map(Number);

                const reminderTimeToday = moment().set({ hour, minute, second: 0, millisecond: 0 });
                const lastReset = rt.last_reset ? moment(rt.last_reset) : moment(reminder.starting_date);

                let shouldReset = false;

                switch (reminder.frequency) {
                    case 'once_daily':
                    case 'twice_daily':
                        shouldReset = now.isAfter(reminderTimeToday) && now.diff(lastReset, 'days') >= 1;
                        break;
                    case 'every_other_day':
                        shouldReset = now.isAfter(reminderTimeToday) &&
                            now.diff(reminder.starting_date, 'days') % 2 === 0 &&
                            now.diff(lastReset, 'days') >= 1;
                        break;
                    case 'once_weekly':
                        shouldReset = now.isAfter(reminderTimeToday) && now.diff(lastReset, 'days') >= 7;
                        break;
                    case 'twice_weekly':
                        shouldReset = now.isAfter(reminderTimeToday) && now.diff(lastReset, 'days') >= 3;
                        break;
                    case 'once_monthly':
                        shouldReset = now.isAfter(reminderTimeToday) && now.diff(lastReset, 'months') >= 1;
                        break;
                }

                if (shouldReset) {
                    reminder.reminder_times[i].is_given = false;
                    reminder.reminder_times[i].last_reset = now.toDate();
                    reminderUpdated = true;
                    resetCount++;
                }
            }

            if (reminderUpdated) {
                await reminder.save();
            }
        }

        return res.status(200).json({ success: true, message: `Reset ${resetCount} reminder times.` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Reminder reset failed", error });
    }
};
export const checkReminderNotifications = async (req, res) => {
    try {
        const now = moment();
        const reminders = await ScheduleReminder.find()
        .populate({path: "medication", select: "medication dosage remaining instructions"})
        .populate({path: "pet", select: "type name age gender breed"})
        // console.log(reminders)
        const dueReminders = [];

        reminders.forEach(reminder => {
            (reminder.reminder_times || []).forEach((rt, index) => {
                if (rt.is_given || rt.skipped) return;
                // console.log("rt:", rt)
                const [hour, minute] = rt.time.split(":").map(Number);
                const reminderTime = moment(reminder.starting_date).set({ hour, minute });

                const remindBeforeMins = parseInt(rt.remind_before || '10');
                const diffMinutes = reminderTime.diff(now, 'minutes');
                // console.log("reminder:", reminder)
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
        const { type, diagnosis, treatment, vetId, date, file, description, notes } = req.body;
        if (!vetId) {
            return res.status(400).json({ message: "Vet ID is required!" });
        }
        if (!type || !diagnosis) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const newMedicalHistory = await MedicalHistory.create({
            pet: petId,
            vet: vetId,
            type,
            diagnosis: diagnosis || "None required",
            treatment,
            date,
            file,
            description,
            notes
        });
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
            .populate("vet", "fullName")
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
        const { type, diagnosis, treatment, vetId, date, file, description, notes } = req.body;

        const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate({ _id: id }, {
            type,
            diagnosis,
            treatment,
            vet: vetId,
            date,
            file,
            description,
            notes
        }, {
            new: true,
            runValidators: true
        });
        console.log("Updated Medical history:", updatedMedicalHistory)
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
        if (!vaccine || !provider) {
            return res.status(400).json({ message: "Vaccine and provider is required" });
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