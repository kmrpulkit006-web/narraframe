import dotenv from "dotenv";
dotenv.config();

import { generatePollinationsImage } from "./providers/pollinations.js";
import { generateGeminiImage } from "./providers/geminiImage.js";

const USE_GEMINI_IMAGES = process.env.USE_GEMINI_IMAGES === "true";

export async function generateImage(prompt, seed, model, referenceImages) {
    if (USE_GEMINI_IMAGES) {
        try {
            const url = await generateGeminiImage(prompt, referenceImages);
            console.log("✅ Gemini image generation succeeded");
            return url;
        } catch (err) {
            console.warn("⚠️ Gemini image generation failed, falling back to Pollinations flux:", err.message);
        }
    }

    return await generatePollinationsImage(prompt, seed, "flux", []);
}