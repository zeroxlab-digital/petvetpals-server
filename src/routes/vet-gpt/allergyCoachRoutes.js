import express from "express";
import userAuthenticated from "../../middlewares/userAuthenticated.js";
import { generateAllergyReport, getAllergyHistories, saveAllergyReport } from "../../controllers/vet-gpt/allergyCoachController.js";
const allergyCoachRouter = express.Router();

allergyCoachRouter.post("/gpt", userAuthenticated, generateAllergyReport);
allergyCoachRouter.post("/save", userAuthenticated, saveAllergyReport);
allergyCoachRouter.get("/history/:petId", userAuthenticated, getAllergyHistories);

export default allergyCoachRouter;