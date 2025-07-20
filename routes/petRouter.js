import express from "express";
import { addMedication, addPetProfile, getMedications, getPetProfiles, updatePetProfile } from "../controllers/petsController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
import upload from "../middlewares/multer.js";
const petRouter = express.Router();

petRouter.get("/get-pets", userAuthenticated, getPetProfiles)
petRouter.post("/add-pet", userAuthenticated, upload.single("image"), addPetProfile);
petRouter.patch("/update-pet/:id", userAuthenticated, upload.single("image"), updatePetProfile);
petRouter.post('/medications/add-medication', userAuthenticated, addMedication);
petRouter.get('/medications/get-medications', userAuthenticated, getMedications);

export default petRouter;