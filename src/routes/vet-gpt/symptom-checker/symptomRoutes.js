import express from 'express';
import { configDotenv } from 'dotenv';
import { SymptomReport } from '../../../models/vet-gpt/SymptomReport.js';
import userAuthenticated from '../../../middlewares/userAuthenticated.js';
import { generateSymptomReport } from '../../../controllers/vet-gpt/symptomController.js';
configDotenv();

const symptomRouter = express.Router();

symptomRouter.post('/gpt', userAuthenticated, generateSymptomReport);

symptomRouter.post('/save', async (req, res) => {
    try {
        const { petId, symptoms, conditions } = req.body;
        // console.log("PET ID(Save):", petId)
        if (!petId || !symptoms || !conditions) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const report = new SymptomReport({ petId, symptoms, conditions });
        await report.save();
        res.json({ message: 'Report saved successfully.' });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save report.' });
    }
});

symptomRouter.get('/history/:petId', async (req, res) => {
    try {
        // console.log("PET ID(History):", req.params.petId)
        if (!req.params.petId) {
            return res.status(400).json({ success: false, message: "Pet ID isn't provided!" })
        }
        const reports = await SymptomReport.find({ petId: req.params.petId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
});

export default symptomRouter;