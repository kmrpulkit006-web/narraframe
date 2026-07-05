const MANHWA_STYLE = `
Style:
Manhwa / Korean webtoon art style.
Clean digital linework, cel-shaded coloring, vibrant flat colors, sharp outlines.
Maintain identical character appearance, proportions, and outfit across every single panel.
No text, no watermarks, no signatures, no panel borders.
`;

function describeCharacter(character) {
    const fields = [
        ["Age", character.age],
        ["Gender", character.gender],
        ["Hair", character.hair],
        ["Eyes", character.eyes],
        ["Outfit", character.outfit],
        ["Accessories", character.accessories]
    ]
        .filter(([, value]) => value && value.trim() !== "")
        .map(([label, value]) => `${label}: ${value}`)
        .join("\n");

    return `${character.name}\n${fields}`;
}

function summarizeCharacterForScene(character) {
    const details = [character.hair, character.eyes, character.outfit]
        .filter(value => value && value.trim() !== "" && value.toLowerCase() !== "none" && value.toLowerCase() !== "n/a")
        .join(", ");

    return details ? `${character.name} (${details})` : character.name;
}

export function buildPrompt(scene, characters) {

    const sceneCharacters = scene.characters
        .map(name => characters.find(c => c.name === name))
        .filter(Boolean);

    const characterDescription = sceneCharacters
        .map(summarizeCharacterForScene)
        .join("; ");

    return `
${MANHWA_STYLE}

Characters:
${characterDescription}

Environment:
${scene.environment}

Action:
${scene.action}

Lighting:
${scene.lighting}

Camera:
${scene.camera}

Mood:
${scene.mood}
`;
}

export function buildCharacterPortraitPrompt(character) {
    return `
${MANHWA_STYLE}

Character reference portrait. Front-facing, plain neutral background, upper body shot, clear view of face and outfit.

${describeCharacter(character)}
`;
}