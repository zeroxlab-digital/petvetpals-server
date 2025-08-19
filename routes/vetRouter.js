import express from "express";
import { getAllVets, getAppointments, getVet, getVetProfile, loginVet, registerVet, updateVetProfile, vetLogout } from "../controllers/vetController.js";
import vetAuthenticated from "../middlewares/vetAuthenticated.js";
const vetRouter = express.Router();

// vet registration login and other vet routers
vetRouter.post("/register", registerVet);
vetRouter.post("/login", loginVet);
vetRouter.post("/logout", vetAuthenticated, vetLogout);
vetRouter.get("/get-vet-profile", vetAuthenticated, getVetProfile);
vetRouter.patch("/update-profile", vetAuthenticated, updateVetProfile);
vetRouter.get("/get-appointments", vetAuthenticated, getAppointments);

// other vet routers for users
vetRouter.get("/all-vets", getAllVets);
vetRouter.get("/all-vets/:id", getVet);

export default vetRouter;