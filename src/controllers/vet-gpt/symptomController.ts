import { NextFunction, Request, Response } from "express";
import { SymptomReport } from "../../models/vet-gpt/SymptomReport.js";
import { conditions, GenerateSymptomReportDTO, symptoms } from "../../types/vet-gpt.types.js";

export const generateSymptomReport = async (req: Request<{}, {}, GenerateSymptomReportDTO>, res: Response, next: NextFunction) => {
    try {
        const { pet, symptoms, conditions } = req.body;

        if (!pet || !symptoms || !conditions) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const prompt = `
            You are Vet GPT, a professional virtual veterinary assistant for PetVetPals. 
            Your role is to carefully analyze reported pet symptoms and suggest likely conditions, 
            recommend safe next steps, and provide owners with practical guidance. 
            Be thorough, accurate, and empathetic — but also clear that you are not a substitute for a licensed veterinarian.

            Pet Information:
            - Type: ${pet.type}
            - Name: ${pet.name}
            - Breed: ${pet.breed}
            - Age: ${pet.age}

            Reported Symptoms:
            ${symptoms.map(s => `- ${s.bodyPart}: ${s.symptoms.join(', ')}`).join('\n')}

            Possible Conditions (AI-matched):
            ${conditions.map(c => `- ${c.name} (${c.matchPercentage}%)`).join('\n')}

            Your task:
            1. Summarize the key symptoms in plain language so the owner understands what might be happening.
            2. Highlight the most relevant potential conditions (focus on those above 40–50% match).
            3. For each high-likelihood condition:
            - Provide a short explanation of the condition and why it might fit.
            - List possible severity (mild, moderate, urgent/emergency).
            - Suggest what the owner can do at home (if safe).
            - State clearly when the pet should be taken to the vet immediately.
            4. Suggest any additional signs or tests the owner should watch for before seeing a vet.
            5. Close with a warm, supportive summary encouraging responsible veterinary care.

            IMPORTANT:
            - Do not provide medication dosages or prescribe treatments.
            - Always emphasize consulting a licensed veterinarian for confirmation and treatment.
            - If symptoms suggest an emergency (e.g., difficulty breathing, seizures, sudden collapse), make that very clear.

            End your response with a line similar to this:
            "Thank you for using Vet GPT - Powered by PetVetPals."
            `.trim();

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
        // console.log("Symptom AI data:", data)
        const content = data.choices?.[0]?.message?.content || 'No recommendation returned.';
        console.log("CONTENT:", content)
        return res.status(200).json({ success: true, recommendation: content });
    } catch (error: unknown) {
        next(error);
    }
}

export const saveSymptomReport = async (req: Request<{}, {}, { petId: string, symptoms: symptoms, conditions: conditions }>, res: Response, next: NextFunction) => {
    try {
        const { petId, symptoms, conditions } = req.body;
        // console.log("PET ID(Save):", petId)
        if (!petId || !symptoms || !conditions) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const report = new SymptomReport({ petId, symptoms, conditions });
        await report.save();
        return res.status(200).json({ message: 'Report saved successfully.' });
    } catch (error: unknown) {
        next(error);
    }
}

export const getSymptomHistory = async (req: Request<{ petId: string }, {}, {}>, res: Response, next: NextFunction) => {
    try {
        // console.log("PET ID(History):", req.params.petId)
        if (!req.params.petId) {
            return res.status(400).json({ success: false, message: "Pet ID isn't provided!" })
        }
        const reports = await SymptomReport.find({ petId: req.params.petId }).sort({ createdAt: -1 }).lean();
        return res.status(200).json(reports);
    } catch (error: unknown) {
        next(error);
    }
}