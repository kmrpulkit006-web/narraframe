export function analyzeStory(parsed) {
    const characters = Array.isArray(parsed.characters) ? parsed.characters : [];

    const scenes = (Array.isArray(parsed.scenes) ? parsed.scenes : []).map((scene, index) => ({
        id: scene.id ?? index + 1,
        title: scene.title || `Scene ${index + 1}`,
        description: scene.description || "",
        characters: Array.isArray(scene.characters) ? scene.characters : [],
        environment: scene.environment || "",
        action: scene.action || "",
        camera: scene.camera || "",
        lighting: scene.lighting || "",
        mood: scene.mood || "",
        dialogue: Array.isArray(scene.dialogue) ? scene.dialogue : []
    }));

    return {
        project: parsed.project || "Untitled Project",
        characters,
        scenes
    };
}