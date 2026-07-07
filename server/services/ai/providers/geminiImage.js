import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = path.join(__dirname, "..", "..", "..", "public", "generated");

if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 });

async function urlToInlinePart(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch reference image: ${url}`);
    }
    const mimeType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
        inlineData: {
            mimeType,
            data: buffer.toString("base64")
        }
    };
}

function saveImageAndGetUrl(base64Data, mimeType) {
    const ext = (mimeType.split("/")[1] || "png").split("+")[0];
    const filename = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
    const filepath = path.join(GENERATED_DIR, filename);
    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
    const apiBaseUrl = process.env.VITE_API_URL || process.env.API_BASE_URL || "http://localhost:5000";
    return `${apiBaseUrl.replace(/\/$/, "")}/generated/${filename}`;
}

export async function generateGeminiImage(prompt, referenceImageUrls = []) {
    const parts = [];

    for (const url of referenceImageUrls) {
        parts.push(await urlToInlinePart(url));
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: parts
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
        throw new Error("Gemini did not return an image for this prompt.");
    }

    return saveImageAndGetUrl(imagePart.inlineData.data, imagePart.inlineData.mimeType);
}