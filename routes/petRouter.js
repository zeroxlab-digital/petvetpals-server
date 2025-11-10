import express from "express";
import { addAllergyCondition, addMedicalHistory, addMedication, addMedReminder, addPetProfile, addVaccination, checkMedReminderNotifications, deleteAllergyCondition, deleteMedicalHistory, deleteMedication, deleteMedReminder, deleteVaccination, getAllergiesConditions, getDetailedPetData, getMedicalHistory, getMedications, getMedReminders, getPetProfiles, getVaccinations, logActivityLevel, logEnergyLevel, markGivenMedReminder, resetMedReminders, updateAllergyCondition, updateMedicalHistory, updateMedication, updateMedReminder, updatePetProfile, updateVaccination } from "../controllers/petsController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
import upload from "../middlewares/multer.js";
const petRouter = express.Router();

// Pet Profiles
petRouter.get("/get-pets", userAuthenticated, getPetProfiles)
petRouter.post("/add-pet", userAuthenticated, upload.single("image"), addPetProfile);
petRouter.patch("/update-pet/:id", userAuthenticated, upload.single("image"), updatePetProfile);
petRouter.get("/detailed-pet-data", userAuthenticated, getDetailedPetData);
petRouter.patch("/log-activity-level", userAuthenticated, logActivityLevel);
petRouter.patch("/log-energy-level", userAuthenticated, logEnergyLevel);

// Pet Medications
petRouter.post('/medications/add-medication', userAuthenticated, addMedication);
petRouter.get('/medications/get-medications', userAuthenticated, getMedications);
petRouter.delete('/medications/delete-medication', userAuthenticated, deleteMedication);
petRouter.patch('/medications/update-medication', userAuthenticated, updateMedication);

// Medications Reminder
petRouter.post('/medications/add-med-reminder', userAuthenticated, addMedReminder);
petRouter.get('/medications/get-med-reminders', userAuthenticated, getMedReminders);
petRouter.delete('/medications/delete-med-reminder', userAuthenticated, deleteMedReminder);
petRouter.patch('/medications/update-med-reminder', userAuthenticated, updateMedReminder);
petRouter.patch('/medications/markgiven-med-reminder', userAuthenticated, markGivenMedReminder);
petRouter.get('/medications/reset-medication-reminders', userAuthenticated, resetMedReminders);
petRouter.get('/medications/check-med-reminder-notifications', userAuthenticated, checkMedReminderNotifications);

// Pet Health Records
petRouter.post('/health-record/add-medical-history', userAuthenticated, addMedicalHistory);
petRouter.get('/health-record/get-medical-history', userAuthenticated, getMedicalHistory);
petRouter.delete('/health-record/delete-medical-history', userAuthenticated, deleteMedicalHistory);
petRouter.patch('/health-record/update-medical-history', userAuthenticated, updateMedicalHistory);

petRouter.post('/health-record/add-vaccination', userAuthenticated, addVaccination);
petRouter.get('/health-record/get-vaccinations', userAuthenticated, getVaccinations);
petRouter.delete('/health-record/delete-vaccination', userAuthenticated, deleteVaccination);
petRouter.patch('/health-record/update-vaccination', userAuthenticated, updateVaccination);

petRouter.post('/health-record/add-allergy-condition', userAuthenticated, addAllergyCondition);
petRouter.get('/health-record/get-allergies-conditions', userAuthenticated, getAllergiesConditions);
petRouter.delete('/health-record/delete-allergy-condition', userAuthenticated, deleteAllergyCondition);
petRouter.patch('/health-record/update-allergy-condition', userAuthenticated, updateAllergyCondition);

export default petRouter;