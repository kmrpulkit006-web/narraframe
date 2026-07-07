import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import "../styles/UploadSection.css";
import ProgressBar from "./ProgressBar";
import AIProcessing from "./AIProcessing";
import CharacterReview from "./CharacterReview";
import GenerationProgress from "./GenerationProgress";
import { useNavigate } from "react-router-dom";
import { saveProject, getAllProjects } from "../utils/db";
import { isLoggedIn, getUser } from "../utils/auth";
import { getCachedImage, setCachedImage, buildCacheKey } from "../utils/imageCache";
import { extractTextFromFile } from "../utils/fileParsers";
import { buildApiUrl } from "../utils/api";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hashStringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % 1_000_000;
}

function UploadSection({ setStoryboard }) {
    const navigate = useNavigate();
    const [story, setStory] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showBurst, setShowBurst] = useState(false);
    const [duplicateMatch, setDuplicateMatch] = useState(null);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [parsingFile, setParsingFile] = useState(false);
    const [showPasteBox, setShowPasteBox] = useState(false);
    const [pasteText, setPasteText] = useState("");

    const [pendingParsed, setPendingParsed] = useState(null);
    const [reviewingCharacters, setReviewingCharacters] = useState(false);
    const [forceNewSeedFlag, setForceNewSeedFlag] = useState(false);

    const [genPhase, setGenPhase] = useState("");
    const [genIndex, setGenIndex] = useState(0);
    const [genTotal, setGenTotal] = useState(0);
    const [genLabel, setGenLabel] = useState("");
    const [genCached, setGenCached] = useState(false);

    const analyzeStoryOnly = async () => {
        if (!story.trim()) return;

        try {
            setLoading(true);

            const res = await fetch(buildApiUrl("/storyboard"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ story })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Server error");

            const parsed = JSON.parse(data.output);
            parsed.seed = hashStringToSeed(story.trim());
            parsed.sourceText = story;

            setPendingParsed(parsed);
            setReviewingCharacters(true);

        } catch (err) {
            console.error(err);
            alert("🚦 Gemini is currently experiencing high demand.\n\nPlease wait 20-30 seconds and try again.");
        } finally {
            setLoading(false);
        }
    };

    const proceedWithGeneration = async () => {
        if (!pendingParsed) return;
        const parsed = pendingParsed;

        if (forceNewSeedFlag) {
            parsed.seed = Math.floor(Math.random() * 1_000_000);
            setForceNewSeedFlag(false);
        }

        const projectSeed = parsed.seed;
        setReviewingCharacters(false);
        setLoading(true);

        try {
            setGenPhase("characters");
            setGenTotal(parsed.characters.length);

            for (let charIndex = 0; charIndex < parsed.characters.length; charIndex++) {
                const character = parsed.characters[charIndex];
                setGenIndex(charIndex + 1);
                setGenLabel(character.name);

                const cacheKey = buildCacheKey({ type: "character", seed: projectSeed, index: charIndex });
                const cachedUrl = await getCachedImage(cacheKey);

                if (cachedUrl) {
                    character.referenceImage = cachedUrl;
                    setGenCached(true);
                    continue;
                }
                setGenCached(false);

                const refRes = await fetch(buildApiUrl("/generate-image"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ character, seed: projectSeed })
                });

                const refData = await refRes.json();

                if (!refRes.ok) {
                    console.error(`Reference image failed for ${character.name}:`, refData.error);
                    await sleep(15000);
                    continue;
                }

                character.referenceImage = refData.imageUrl;
                await setCachedImage(cacheKey, refData.imageUrl);
                await sleep(15000);
            }

            setGenPhase("scenes");
            setGenTotal(parsed.scenes.length);

            for (let sceneIndex = 0; sceneIndex < parsed.scenes.length; sceneIndex++) {
                const scene = parsed.scenes[sceneIndex];
                setGenIndex(sceneIndex + 1);
                setGenLabel(scene.title);

                const cacheKey = buildCacheKey({ type: "scene", seed: projectSeed, index: sceneIndex });
                const cachedUrl = await getCachedImage(cacheKey);

                if (cachedUrl) {
                    scene.image = cachedUrl;
                    setGenCached(true);
                    continue;
                }
                setGenCached(false);

                const imageRes = await fetch(buildApiUrl("/generate-image"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ scene, characters: parsed.characters, seed: projectSeed })
                });

                const imageData = await imageRes.json();

                if (!imageRes.ok) {
                    console.error(`Image generation failed for scene "${scene.title}":`, imageData.error);
                    await sleep(15000);
                    continue;
                }

                scene.image = imageData.imageUrl;
                await setCachedImage(cacheKey, imageData.imageUrl);
                await sleep(15000);
            }

            if (isLoggedIn()) {
                try {
                    const user = getUser();
                    const newId = await saveProject(parsed, user?.id);
                    localStorage.setItem("storyboardProjectId", newId);
                } catch (err) {
                    console.error("Failed to save project to library:", err);
                }
            } else {
                localStorage.removeItem("storyboardProjectId");
            }

            localStorage.setItem("storyboard", JSON.stringify(parsed));
            setStoryboard(parsed);
            setPendingParsed(null);
            setGenPhase("");
            navigate("/viewer");

        } catch (err) {
            console.error(err);
            alert("Something went wrong during image generation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    async function findDuplicateProject() {
        if (!isLoggedIn()) return null;

        try {
            const user = getUser();
            const all = await getAllProjects(user?.id);
            const trimmedStory = story.trim();
            return all.find(p => p.data?.sourceText && p.data.sourceText.trim() === trimmedStory) || null;
        } catch (err) {
            console.error("Failed to check for duplicate project:", err);
            return null;
        }
    }

    async function handleStartCreating() {
        setCheckingDuplicate(true);
        const match = await findDuplicateProject();
        setCheckingDuplicate(false);

        if (match) {
            setDuplicateMatch(match);
        } else {
            analyzeStoryOnly();
        }
    }

    function openExistingProject(view) {
        localStorage.setItem("storyboard", JSON.stringify(duplicateMatch.data));
        setStoryboard(duplicateMatch.data);
        setDuplicateMatch(null);
        navigate(view === "manhwa" ? "/manhwa" : "/viewer");
    }

    function generateNewAnyway() {
        setDuplicateMatch(null);
        setForceNewSeedFlag(true);
        analyzeStoryOnly();
    }

    async function loadFile(file) {
        setParsingFile(true);
        try {
            const text = await extractTextFromFile(file);
            setStory(text);
            setIsAnalyzing(false);
            setCurrentStep(0);
            setProgress(0);
            setShowBurst(false);
            setSelectedFile(file);
            setShowResults(false);
        } catch (err) {
            console.error("Failed to parse file:", err);
            alert(`Couldn't read this file: ${err.message || "unsupported or corrupted file."}`);
        } finally {
            setParsingFile(false);
        }
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        await loadFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        if (!file) return;
        await loadFile(file);
    };

    function usePastedText() {
        if (!pasteText.trim()) return;
        setStory(pasteText);
        setIsAnalyzing(false);
        setCurrentStep(0);
        setProgress(0);
        setShowBurst(false);
        setSelectedFile({ name: "Pasted Text" });
        setShowResults(false);
        setShowPasteBox(false);
    }

    useEffect(() => {
        if (!selectedFile) return;

        setIsUploading(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setShowBurst(true);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [selectedFile]);

    useEffect(() => {
        if (!isAnalyzing) return;

        const totalSteps = 5;
        setCurrentStep(0);
        let step = 0;

        const interval = setInterval(() => {
            step++;
            setCurrentStep(step);

            if (step >= totalSteps) {
                clearInterval(interval);
                setTimeout(() => setShowResults(true), 800);
            }
        }, 1200);

        return () => clearInterval(interval);
    }, [isAnalyzing]);

    return (
        <section id="upload-section" className="upload-section">

            <motion.div
                className={`upload-card ${isDragging ? "dragging" : ""}`}
                whileHover={{ scale: 1.02 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload size={55} />

                <h2>{isDragging ? "Drop your story here!" : "Upload Your Story"}</h2>

                <p>Drag & Drop your novel, screenplay, manga or fanfiction.</p>

                <span>
                    Supported Files
                    <strong>TXT • PDF • DOCX • EPUB</strong>
                </span>

                <label className="upload-button">
                    <input
                        type="file"
                        accept=".txt,.pdf,.docx,.epub"
                        hidden
                        onChange={handleFileChange}
                    />
                    {selectedFile ? "Change File" : "Choose File"}
                </label>

                <button
                    type="button"
                    className="paste-toggle-btn"
                    onClick={() => setShowPasteBox((v) => !v)}
                >
                    {showPasteBox ? "Cancel" : "📋 Or paste your story text"}
                </button>

                {showPasteBox && (
                    <div className="paste-box">
                        <textarea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            placeholder="Paste your story text here..."
                            rows={8}
                        />
                        <button
                            type="button"
                            className="upload-button"
                            disabled={!pasteText.trim()}
                            onClick={usePastedText}
                        >
                            Use This Text
                        </button>
                    </div>
                )}

                {parsingFile && (
                    <p className="parsing-note">📄 Extracting text from your file...</p>
                )}

                {selectedFile && (
                    <div className="file-info">
                        <p className="file-name">📄 {selectedFile.name}</p>

                        <span className="upload-status">
                            {isUploading ? `Uploading... ${progress}%` : "✅ Ready for AI Analysis"}
                        </span>

                        {isUploading && (
                            <ProgressBar
                                progress={progress}
                                showBurst={showBurst}
                                setShowBurst={setShowBurst}
                                setIsUploading={setIsUploading}
                                setIsAnalyzing={setIsAnalyzing}
                            />
                        )}

                        {isAnalyzing && !showResults && (
                            <AIProcessing currentStep={currentStep} />
                        )}

                        {showResults && (
                            <button
                                onClick={handleStartCreating}
                                disabled={loading || checkingDuplicate}
                                className="upload-button"
                            >
                                {checkingDuplicate ? "Checking..." : loading ? "Analyzing..." : "Start Creating 🚀"}
                            </button>
                        )}

                        {loading && genPhase && (
                            <GenerationProgress
                                phase={genPhase}
                                index={genIndex}
                                total={genTotal}
                                label={genLabel}
                                cached={genCached}
                            />
                        )}
                    </div>
                )}
            </motion.div>

            {duplicateMatch && (
                <div className="duplicate-modal-overlay">
                    <div className="duplicate-modal">
                        <h3>You've generated this story before</h3>
                        <p>
                            "{duplicateMatch.project}" ({duplicateMatch.sceneCount} scenes) was created from what looks like the same text.
                        </p>

                        <div className="duplicate-modal-actions">
                            <button onClick={() => openExistingProject("manhwa")}>📖 View Existing (Manhwa)</button>
                            <button onClick={() => openExistingProject("classic")}>🎬 View Existing (Classic)</button>
                            <button onClick={generateNewAnyway}>✨ Generate New Version Anyway</button>
                            <button className="duplicate-cancel" onClick={() => setDuplicateMatch(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {reviewingCharacters && pendingParsed && (
                <CharacterReview
                    characters={pendingParsed.characters}
                    onChange={(updated) => setPendingParsed({ ...pendingParsed, characters: updated })}
                    onContinue={proceedWithGeneration}
                    onCancel={() => {
                        setReviewingCharacters(false);
                        setPendingParsed(null);
                    }}
                />
            )}

        </section>
    );
}

export default UploadSection;