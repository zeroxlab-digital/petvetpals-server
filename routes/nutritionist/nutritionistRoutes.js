import { configDotenv } from "dotenv";
import express from "express";
import fetch from "node-fetch";
configDotenv();

const nutritionistRouter = express.Router();

// Empty JSON structure fallback
const emptyNutritionPlan = {
    dailyCalories: 0,
    proteinNeeds: "",
    fatNeeds: "",
    carbNeeds: "",
    feedingSchedule: [],
    recommendedIngredients: [],
    avoidIngredients: [],
    brandRecommendations: [],
};

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

// Repaires JSON using free model if needed
async function repairJSONWithFreeModel(brokenOutput) {
    try {
        const repairPrompt = `
Fix the following broken JSON. Return only valid JSON. Preserve all original data.
Input:
${brokenOutput}
`;
        const response = await fetch("https://api.together.xyz/inference", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3-8b-chat-hf",
                prompt: repairPrompt,
                max_tokens: 1500,
                temperature: 0,
            }),
        });
        const data = await response.json();
        const fixedText = data.output?.choices?.[0]?.text?.trim();
        return extractJSONFromAI(fixedText) || null;
    } catch {
        return null;
    }
}

nutritionistRouter.post("/ask-nutritionist", async (req, res) => {
    try {
        const { pet, activity_level, medical_conditions, current_symptoms, nutrition_goals, known_allergies, current_diet } = req.body;

        if (!pet || !activity_level || !nutrition_goals) {
            return res.status(400).json({ success: false, message: "Pet, Activity Level, and Nutrition Goals are required!" });
        }

        const prompt = `
You are a professional pet nutritionist specializing in dogs and cats. 
Analyze the following pet details and provide a personalized nutrition plan. 
**Output only valid JSON**, with no extra text, Markdown, or comments. 
All values should be generated specifically for this pet based on its details.

Pet Details:
Species: ${pet.type}
Pet Name: ${pet.name}
Age: ${pet.age}
Gender: ${pet.gender}
Breed: ${pet.breed}
Activity Level: ${activity_level}
Medical Conditions: ${medical_conditions?.length ? medical_conditions.join(", ") : "None"}
Current Symptoms: ${current_symptoms?.length ? current_symptoms.join(", ") : "None"}
Allergies: ${known_allergies?.length ? known_allergies.join(", ") : "None"}
Current Diet: ${current_diet?.length ? current_diet.join(", ") : "None"}

Required JSON format:
{
  "dailyCalories": number,                // Total daily calories
  "proteinNeeds": "X-Y%",                 // Percentage of protein
  "fatNeeds": "X-Y%",                     // Percentage of fat
  "carbNeeds": "X-Y%",                    // Percentage of carbohydrates
  "feedingSchedule": [                     // List of meals
    { "meal": "Breakfast|Lunch|Dinner", "time": "HH:MM AM/PM", "portion": "amount" }
  ],
  "recommendedIngredients": [             // List of recommended ingredients
    { "name": "Ingredient name", "type": "Protein|Fat|Carbohydrate|Antioxidant", "benefit": "Reason for recommendation" }
  ],
  "avoidIngredients": [                   // Ingredients that are harmful for this pet
    "Ingredient1", "Ingredient2"
  ],
  "brandRecommendations": [               // Optional recommended pet food brands
    { "name": "Brand Name", "price": "$XX.XX", "rating": 4.5, "affiliate": true|false, "reason": "Reason for recommendation" }
  ]
}
`
;

        const aiResponse = await fetch("https://api.together.xyz/inference", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3-8b-chat-hf",
                prompt,
                max_tokens: 1500,
                temperature: 0.7,
            }),
        });

        const data = await aiResponse.json();
        const rawOutput = data.output?.choices?.[0]?.text;
        let plan = extractJSONFromAI(rawOutput);
        console.log("PLAN:", plan)
        if (!plan) {
            console.warn("AI output invalid JSON — attempting repair...");
            plan = await repairJSONWithFreeModel(rawOutput);
        }

        if (!plan) {
            console.error("Both main model and repair model failed. Returning empty nutrition plan.");
            plan = emptyNutritionPlan;
        }

        res.json({ success: true, plan });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error! Failed to ask nutritionist.", error });
    }
});

export default nutritionistRouter;
