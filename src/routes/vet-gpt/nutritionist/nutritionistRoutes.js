import { configDotenv } from "dotenv";
import express from "express";
import userAuthenticated from "../../../middlewares/userAuthenticated.js";
import { generateNutritionReport } from "../../../controllers/vet-gpt/nutritionistController.js";
configDotenv();

const nutritionistRouter = express.Router();

nutritionistRouter.post("/ask-nutritionist", userAuthenticated, generateNutritionReport);

export default nutritionistRouter;