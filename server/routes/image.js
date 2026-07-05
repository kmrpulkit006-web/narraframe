import express from "express";
import { generateImage } from "../services/ai/imageService.js";
import { buildPrompt, buildCharacterPortraitPrompt } from "../services/ai/promptCompiler.js";

const router = express.Router();


router.post("/", async (req, res) => {

    console.log("========== NEW REQUEST ==========");
    console.log(req.body);

    try {

        const { scene, characters, character, seed } = req.body;

        let prompt;
        let model;
        let referenceImages = [];

        if (character) {
            // One-time reference portrait for a single character
            console.log("Building character reference prompt for:", character.name);
            prompt = buildCharacterPortraitPrompt(character);
            model = "flux";
        } else {
            console.log("Scene received:", scene);
            console.log("Characters received:", characters);
            console.log("Building prompt...");

            prompt = buildPrompt(scene, characters);

            referenceImages = (characters || [])
                .filter(c => scene.characters.includes(c.name))
                .map(c => c.referenceImage)
                .filter(Boolean);

            model = referenceImages.length > 0 ? "kontext" : "flux";
        }

        const imageUrl = await generateImage(prompt, seed, model, referenceImages);

        console.log(`Generated URL (${imageUrl.length} chars):`, imageUrl);

        res.json({
            imageUrl
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

export default router;