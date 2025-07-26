import express from 'express';
import { configDotenv } from 'dotenv';
import { SymptomReport } from '../../models/symptom-checker/SymptomReport.js';
// import { OpenAI } from 'openai';
configDotenv();

const symptomRouter = express.Router();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

symptomRouter.post('/gpt', async (req, res) => {
    try {
        const { pet, symptoms, conditions } = req.body;

        if (!pet || !symptoms || !conditions) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const prompt = `
        You are a professional veterinarian assistant helping assess pet symptoms.

        Here are the symptoms reported for a pet:
        Pet Type: ${pet.type}
        Pet Name: ${pet.name}
        Breed: ${pet.breed}
        Age: ${pet.age}

        Symptoms:
        ${symptoms.map(s => `- ${s.bodyPart}: ${s.symptoms.join(', ')}`).join('\n')}

        Potential Conditions:
        ${conditions.map(c => `- ${c.name} (${c.matchPercentage}%)`).join('\n')}

        What do you recommend as next steps?
        However, at the end of the response, include - "Thank you for using Vet GPT - Powered by PetVetPals."
    `.trim();

    // console.log("PROMPT:", prompt)

        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                messages: [
                    { role: 'system', content: 'You are a helpful veterinary assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        // console.log("DATA:", data)
        const content = data.choices?.[0]?.message?.content || 'No recommendation returned.';
        console.log("CONTENT:", content)
        res.json({ recommendation: content });

    } catch (error) {
        console.error('Together AI error:', error);
        res.status(500).json({ error: 'Failed to get AI recommendation.' });
    }
});

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




// import express from 'express';
// import { configDotenv } from 'dotenv';
// import { SymptomReport } from '../../models/symptom-checker/SymptomReport.js';
// import { OpenAI } from 'openai';

// configDotenv();

// const symptomRouter = express.Router();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // === POST /api/symptoms/gpt ===
// symptomRouter.post('/gpt', async (req, res) => {
//   try {
//     const { pet, symptoms, conditions } = req.body;

//     if (!pet || !symptoms || !conditions) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     const messages = [
//       {
//         role: 'system',
//         content: 'You are a professional veterinarian assistant helping assess pet symptoms.'
//       },
//       {
//         role: 'user',
//         content: `Here are the symptoms reported for a pet:
// Pet Name: ${pet.name}
// Breed: ${pet.breed}
// Age: ${pet.age}

// Symptoms:
// ${symptoms.map((s) => `- ${s.bodyPart}: ${s.symptoms.join(', ')}`).join('\n')}

// Potential Conditions:
// ${conditions.map((c) => `- ${c.name} (${c.matchPercentage}%)`).join('\n')}

// What do you recommend as next steps?`
//       }
//     ];

//     const chat = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages,
//       temperature: 0.7,
//     });

//     console.log("CHAT:", chat)

//     const content = chat.choices?.[0]?.message?.content || 'No recommendation returned.';
//     console.log("CONTENT:", content)
//     res.json({ recommendation: content });

//   } catch (error) {
//     console.error('GPT error:', error);
//     res.status(500).json({ error: 'Failed to get GPT recommendation.' });
//   }
// });

// // === POST /api/symptoms/save ===
// symptomRouter.post('/save', async (req, res) => {
//   try {
//     const { petId, symptoms, conditions } = req.body;
//     console.log("PET ID(Save):", petId)
//     if (!petId || !symptoms || !conditions) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     const report = new SymptomReport({ petId, symptoms, conditions });
//     await report.save();
//     res.json({ message: 'Report saved successfully.' });
//   } catch (error) {
//     console.error('Save error:', error);
//     res.status(500).json({ error: 'Failed to save report.' });
//   }
// });

// // === GET /api/symptoms/history/:petId ===
// symptomRouter.get('/history/:petId', async (req, res) => {
//   try {
//     console.log("PET ID(History):", req.params.petId)
//     if(!req.params.petId) {
//         return res.status(400).json({ success: false, message: "Pet ID isn't provided!" })
//     }
//     const reports = await SymptomReport.find({ petId: req.params.petId }).sort({ createdAt: -1 });
//     res.json(reports);
//   } catch (error) {
//     console.error('Fetch error:', error);
//     res.status(500).json({ error: 'Failed to fetch history.' });
//   }
// });

// export default symptomRouter;


