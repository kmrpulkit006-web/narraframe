import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { analyzeStory } from "../services/ai/storyAnalyzer.js";

async function generateWithRetry(prompt, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
        } catch (error) {
            lastError = error;

            const isRetryable = error.message && (
                error.message.includes("overloaded") ||
                error.message.includes("503") ||
                error.message.includes("UNAVAILABLE")
            );

            if (!isRetryable || attempt === maxRetries - 1) {
                throw error;
            }

            const delay = 2000 * Math.pow(2, attempt); // 2s, then 4s, then 8s
            console.warn(`Gemini busy, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

async function generateWithHuggingFace(prompt) {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("Hugging Face returned no content");
    }

    return text;
}


const router = express.Router();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post("/", async (req, res) => {

    try {

        const { story } = req.body;

        const prompt = `
You are an expert film director, storyboard artist and comic creator.

Analyze the story and return ONLY valid JSON.

The JSON must follow this structure exactly:

{
  "project": "Project Name",

  "characters": [
    {
      "name": "",
      "age": "",
      "gender": "",
      "hair": "",
      "eyes": "",
      "outfit": "",
      "accessories": ""
    }
  ],

 "scenes": [
    {
      "id": 1,
      "title": "",
      "description": "",
      "characters": [],
      "environment": "",
      "action": "",
      "camera": "",
      "lighting": "",
      "mood": "",
      "dialogue": [
        { "speaker": "", "line": "" }
      ]
    }
  ]
}

Rules:

- Return ONLY JSON.
- Do NOT wrap it inside markdown.
- Every recurring character must appear only once in the "characters" array.
- Each scene should reference characters only by their names.
- Keep descriptions concise.
- Choose cinematic camera angles.
- Describe the environment clearly.
- Describe the main action happening in the scene.
- Choose realistic lighting.
- Keep moods short.
- If a scene has spoken dialogue, list each line under "dialogue" with the correct speaker name. If a scene is silent, return an empty array.
- Split the story into a new scene whenever there is a meaningful shift in action, dialogue, setting, or time. Prefer more, shorter scenes over fewer, long ones — a short story should still produce at least 4-6 scenes if there are that many distinct narrative beats.

Story:

${story}
`;

        let rawText;

        try {
            const response = await generateWithRetry(prompt);
            rawText = response.text;
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed after retries, falling back to Hugging Face:", geminiError.message);

            try {
                rawText = await generateWithHuggingFace(prompt);
                console.log("✅ Hugging Face fallback succeeded");
            } catch (hfError) {
                console.error("Hugging Face fallback also failed:", hfError.message);
                throw geminiError;
            }
        }

        const cleanResponse = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanResponse);
        } catch (err) {
            console.error("Gemini returned invalid JSON:", cleanResponse);
            return res.status(502).json({
                error: "AI returned malformed data. Please try again."
            });
        }

        const analyzed = analyzeStory(parsed);

        res.json({
            output: JSON.stringify(analyzed)
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            error: error.message || "Something went wrong."
        });
    }

});


export default router;