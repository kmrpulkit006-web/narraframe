export async function generatePollinationsImage(prompt, seed, model = "flux", referenceImages = []) {
    const encodedPrompt = encodeURIComponent(prompt);
    const seedParam = seed !== undefined ? `&seed=${seed}` : "";
    const imageParam = referenceImages.length > 0
        ? `&image=${referenceImages.map(encodeURIComponent).join("|")}`
        : "";

    return `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=1024&height=768&nologo=true${seedParam}${imageParam}`;
}