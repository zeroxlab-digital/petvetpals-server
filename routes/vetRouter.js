import express from "express";
import { getAllVets, getVet, loginVet, registerVet, updateVetProfile, vetLogout } from "../controllers/vetController.js";
import vetAuthenticated from "../middlewares/vetAuthenticated.js";
const vetRouter = express.Router();

// vet registration and login routers
vetRouter.post("/register", registerVet);
vetRouter.post("/login", loginVet);
vetRouter.patch("/update/:id", vetAuthenticated, updateVetProfile)
vetRouter.post("/logout", vetAuthenticated, vetLogout)

// vet related routers
vetRouter.get("/all-vets", getAllVets);
vetRouter.get("/all-vets/:id", getVet);

export default vetRouter;