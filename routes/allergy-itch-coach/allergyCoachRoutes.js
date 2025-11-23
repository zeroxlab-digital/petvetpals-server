import express from "express";
import { configDotenv } from "dotenv";
import { AllergyItchReport } from "../../models/vet-gpt/AllergyItchModel.js";
import userAuthenticated from "../../middlewares/userAuthenticated.js";
configDotenv();
const allergyCoachRouter = express.Router();

// Extract first valid JSON object from string
function extractJSONFromAI(text) {
    try {
        const firstBrace = text.indexOf("{");
        if (firstBrace === -1) return null;

        // Count braces to find matching closing brace
        let count = 0;
        let endIndex = -1;
        for (let i = firstBrace; i < text.length; i++) {
            if (text[i] === "{") count++;
            else if (text[i] === "}") count--;
            if (count === 0) {
                endIndex = i + 1;
                break;
            }
        }
        if (endIndex === -1) return null;

        const jsonString = text.slice(firstBrace, endIndex);
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}

allergyCoachRouter.post("/gpt", async (req, res) => {
    try {
        const {
            // Pet
            pet,
            // Current Episode
            startDate,
            affectedAreas,
            severity,
            visibleSigns,
            // Environment
            currentSeason,
            recentChanges,
            livingEnvironment,
            // Additional info
            currentMedications,
            knownAllergies,
            previousTreatments,
        } = req.body;
        if (!startDate || !affectedAreas || !severity) {
            throw new Error({ message: "Start date, affected areas and severity fields are required!" })
        }
        const prompt = `
        You are an expert AI Allergy & Itch Care Coach for pets, with extensive experience in veterinary dermatology and allergy management. 
        Create a structured, personalized, and actionable care plan based on the pet case below. Focus on safety, practicality, and prevention of complications. 
        Return a single valid JSON object that strictly matches the schema provided.

        ### Pet Allergy Case
        - Pet Species: ${pet.type}
        - Pet Name: ${pet.name}
        - Pet Breed: ${pet.breed}
        - Pet Gender: ${pet.gender}
        - Pet Age: ${pet.age} years old
        - Start Date: ${startDate}
        - Severity: ${severity}/10
        - Affected Areas: ${affectedAreas.join(", ")}
        - Visible Signs: ${visibleSigns.join(", ")}
        - Current Season: ${currentSeason || "unknown"}
        - Recent Changes: ${recentChanges.join(", ") || "none"}
        - Living Environment: ${livingEnvironment || "not specified"}
        - Current Medications: ${currentMedications.join(", ") || "none"}
        - Known Allergies: ${knownAllergies.join(", ") || "none"}
        - Previous Treatments: ${previousTreatments || "none"}

        ### Guidance for JSON Output
        - **urgencyLevel**: Consider severity, number of affected areas, visible signs, and risk of secondary infection. Use 'urgent', 'moderate', or 'routine'.
        - **vetConsultation**: True if professional assessment is needed, especially in severe cases or if infection is likely.
        - **immediateActions**: Provide safe, actionable steps that owners can take at home (e.g., gentle cool compress, bathing with medicated shampoo), **without recommending extra medications or unsafe doses**.
        - **homeCareTips**: Include daily routines, skin care, grooming, diet, and environmental management (e.g., wiping paws, using air filters, limiting allergen exposure). Each tip must be concise and practical.
        - **productRecommendations**: Suggest safe, commonly available products for symptom relief or allergen avoidance. Include reason for use.
        - **avoidanceList**: Based on known allergies and environmental triggers. Include actionable advice to reduce exposure.
        - **followUpSchedule**: Provide clear timeframe for monitoring and professional check-ups, prioritizing health and safety.
        - **rationale**: Include a short explanation (3–5 sentences) justifying the urgencyLevel and vetConsultation recommendations. Specifically mention:
            - Risk of infection due to scratching or redness
            - Known diet or environmental triggers
            - Reason why this case is urgent, moderate, or routine
        - **educationalInfo**: Provide concise, easy-to-understand explanations for the pet owner about:
            - Why these allergy and itch symptoms occur
            - Common misconceptions about pet allergies
            - Preventive measures to reduce future flare-ups

        ### JSON Schema
        {
        "urgencyLevel": "urgent | moderate | routine",
        "vetConsultation": true | false,
        "immediateActions": [ "..." ],
        "homeCareTips": [
            { "category": "string", "icon": "emoji", "tips": ["..."] }
        ],
        "productRecommendations": [
            { "name": "string", "type": "string", "price": "string", "reason": "string" }
        ],
        "avoidanceList": ["..."],
        "followUpSchedule": [
            { "timeframe": "string", "action": "string" }
        ],
        "rationale": "string",
        "educationalInfo": ["string"]
        }

        Now, from a pet allergy & itch coach perspective, generate the JSON output **for this case only**. 
        Do not repeat instructions, do not include explanations outside the JSON. Be professional, precise, and thorough, prioritizing ${pet.name}'s safety, comfort, and risk prevention.
        `;

        const aiResponse = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // model: "meta-llama/Llama-3-8b-chat-hf",
                model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
                prompt,
                max_tokens: 1500,
                temperature: 0.7,
            })
        })
        // console.log("Allergy Coach AI RESPONSE:", aiResponse)
        const data = await aiResponse.json();
        // console.log("Allergy Coach AI data:", data)
        const rawOutput = data?.choices?.[0]?.text;
        // console.log("Raw allergy output:", rawOutput)
        const coach_response = extractJSONFromAI(rawOutput);
        console.log("Coach Response:", coach_response);
        res.status(200).json({ success: true, coach_response })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error", error })
    }
})

allergyCoachRouter.post("/save", async (req, res) => {
    try {
        const { pet, episode } = req.body;
        if(!pet || !episode) {
            throw new Error({ message: "Pet ID and episode fields are required!" })
        }
        const allergyItchReport = new AllergyItchReport({
            pet,
            episode
        });
        await allergyItchReport.save();
        res.status(200).json({ success: true, message: "Allergy & Itch report saved successfully."});
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal server error", error })
    }
})

export default allergyCoachRouter;