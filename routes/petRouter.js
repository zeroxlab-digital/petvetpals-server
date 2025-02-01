import express from "express";
import { addPetProfile, getPetProfiles, updatePetProfile } from "../controllers/petsController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js";
const petRouter = express.Router();

petRouter.get("/get-pets", userAuthenticated, getPetProfiles)
petRouter.post("/add-pet", userAuthenticated, addPetProfile);
petRouter.patch("/add-pet", userAuthenticated, updatePetProfile);

export default petRouter;