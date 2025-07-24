import express from "express";
import { addAllergyCondition, addMedicalHistory, addMedication, addMedScheduleReminder, addPetProfile, addVaccination, deleteAllergyCondition, deleteMedicalHistory, deleteMedication, deleteMedScheduledReminder, deleteVaccination, getAllergiesConditions, getMedicalHistory, getMedications, getMedScheduledReminders, getPetProfiles, getVaccinations, updateAllergyCondition, updateMedicalHistory, updateMedication, updatePetProfile, updateVaccination } from "../controllers/petsController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
import upload from "../middlewares/multer.js";
const petRouter = express.Router();

// Pet Profiles
petRouter.get("/get-pets", userAuthenticated, getPetProfiles)
petRouter.post("/add-pet", userAuthenticated, upload.single("image"), addPetProfile);
petRouter.patch("/update-pet/:id", userAuthenticated, upload.single("image"), updatePetProfile);

// Pet Medications
petRouter.post('/medications/add-medication', userAuthenticated, addMedication);
petRouter.get('/medications/get-medications', userAuthenticated, getMedications);
petRouter.delete('/medications/delete-medication', userAuthenticated, deleteMedication);
petRouter.patch('/medications/update-medication', userAuthenticated, updateMedication);

// Medications Schedule Reminder
petRouter.post('/medications/add-schedule-reminder', userAuthenticated, addMedScheduleReminder);
petRouter.get('/medications/get-scheduled-reminders', userAuthenticated, getMedScheduledReminders);
petRouter.delete('/medications/delete-scheduled-reminder', userAuthenticated, deleteMedScheduledReminder);

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