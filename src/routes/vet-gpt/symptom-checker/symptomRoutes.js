import express from 'express';
import { configDotenv } from 'dotenv';
import userAuthenticated from '../../../middlewares/userAuthenticated.js';
import { generateSymptomReport, getSymptomHistory, saveSymptomReport } from '../../../controllers/vet-gpt/symptomController.js';
configDotenv();

const symptomRouter = express.Router();

symptomRouter.post('/gpt', userAuthenticated, generateSymptomReport);
symptomRouter.post('/save', userAuthenticated, saveSymptomReport);
symptomRouter.get('/history/:petId', userAuthenticated, getSymptomHistory);

export default symptomRouter;