import { configDotenv } from "dotenv";
import express from "express";
import fetch from "node-fetch";
configDotenv();

const nutritionistRouter = express.Router();

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

nutritionistRouter.post("/ask-nutritionist", async (req, res) => {
    try {
        const { pet, activityLevel, medicalConditions, currentSymptoms, treatmentGoals, knownAllergies, currentDiet } = req.body;
        console.log("pet:", pet)
        if (!pet || !activityLevel || !treatmentGoals) {
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
        Activity Level: ${activityLevel}
        Medical Conditions: ${medicalConditions?.length ? medicalConditions.join(", ") : "None"}
        Current Symptoms: ${currentSymptoms?.length ? currentSymptoms.join(", ") : "None"}
        Allergies: ${knownAllergies?.length ? knownAllergies.join(", ") : "None"}
        Current Diet: ${currentDiet?.length ? currentDiet.join(", ") : "None"}

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
        ]
        }
        `
            ;

        const aiResponse = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // model: "meta-llama/Llama-3-8b-chat-hf",
                model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
                prompt,
                max_tokens: 1500,
                temperature: 0.7,
            }),
        });
        // console.log("Nutrition AI RESPONSE:", aiResponse)
        const data = await aiResponse.json();
        // console.log("Nutrition AI data:", data)
        const rawOutput = data?.choices?.[0]?.text;
        let plan = extractJSONFromAI(rawOutput);

        // if (!plan) {
        //     console.warn("AI output invalid JSON — attempting repair...");
        //     plan = await repairJSONWithFreeModel(rawOutput);
        // }

        if (!plan) {
            console.error("Model failed generating nutrition plan. Returning empty nutrition plan.");
            // plan = emptyNutritionPlan;
        }

        console.log("PLAN:", plan)

        res.json({ success: true, plan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error! Failed to ask nutritionist.", error });
    }
});

export default nutritionistRouter;

