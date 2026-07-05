import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import "../styles/UploadSection.css";
import ProgressBar from "./ProgressBar";
import AIProcessing from "./AIProcessing";
import ResultsDashboard from "./ResultsDashboard";
import StoryboardViewer from "../pages/StoryboardViewer";
import { useNavigate } from "react-router-dom";
import { saveProject, getAllProjects } from "../utils/db";
import { isLoggedIn, getUser } from "../utils/auth";
import { getCachedImage, setCachedImage, buildCacheKey } from "../utils/imageCache";

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
    const generateStoryboard = async (forceNewSeed = false) => {
        if (!story.trim()) return;

        try {
            setLoading(true);

            const res = await fetch("http://localhost:5000/storyboard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ story })
            });

            const data = await res.json();

            console.log(data);

            if (!res.ok) {
                throw new Error(data.error || "Server error");
            }

            const parsed = JSON.parse(data.output);
            const projectSeed = forceNewSeed
                ? Math.floor(Math.random() * 1_000_000)
                : hashStringToSeed(story.trim());
            parsed.seed = projectSeed;
            parsed.sourceText = story;

            for (const character of parsed.characters) {

                const cacheKey = buildCacheKey({ type: "character", character, seed: projectSeed });
                const cachedUrl = await getCachedImage(cacheKey);

                if (cachedUrl) {
                    character.referenceImage = cachedUrl;
                    continue;
                }

                const refRes = await fetch("http://localhost:5000/generate-image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        character,
                        seed: projectSeed
                    })
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

            for (const scene of parsed.scenes) {

                const cacheKey = buildCacheKey({ type: "scene", scene, characters: parsed.characters, seed: projectSeed });
                const cachedUrl = await getCachedImage(cacheKey);

                if (cachedUrl) {
                    scene.image = cachedUrl;
                    continue;
                }

                const imageRes = await fetch("http://localhost:5000/generate-image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        scene,
                        characters: parsed.characters,
                        seed: projectSeed
                    })
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
                    await saveProject(parsed, user?.id);
                } catch (err) {
                    console.error("Failed to save project to library:", err);
                }
            } else {
                console.info("Not logged in — story generated but not saved to My Projects.");
            }

            localStorage.setItem(
                "storyboard",
                JSON.stringify(parsed)
            );

            setStoryboard(parsed);

            navigate("/viewer");

        } catch (err) {
            console.error(err);

            alert(
                "🚦 Gemini is currently experiencing high demand.\n\nPlease wait 20-30 seconds and try again."
            );
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
            generateStoryboard();
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
        generateStoryboard(true);
    }
    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                console.log(story);
                setStory(e.target.result);
            };

            reader.readAsText(file);

            setIsAnalyzing(false);
            setCurrentStep(0);
            setProgress(0);
            setShowBurst(false);
            setSelectedFile(file);
            setShowResults(false);

        }
    };
    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();

        setIsDragging(false);

        const file = event.dataTransfer.files[0];

        if (file) {
            setIsAnalyzing(false);
            setShowResults(false);
            setCurrentStep(0);
            setProgress(0);
            setShowBurst(false);
            setSelectedFile(file);
        }
    };
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

                setTimeout(() => {

                    setShowResults(true);

                }, 800);

            }

        }, 1200);

        return () => clearInterval(interval);

    }, [isAnalyzing]);
    return (
        <section
            id="upload-section"
            className="upload-section"
        >

            <motion.div
                className={`upload-card ${isDragging ? "dragging" : ""}`}

                whileHover={{ scale: 1.02 }}

                onDragOver={handleDragOver}

                onDragLeave={handleDragLeave}

                onDrop={handleDrop}
            >

                <Upload size={55} />

                <h2>
                    {isDragging
                        ? "Drop your story here!"
                        : "Upload Your Story"}
                </h2>

                <p>
                    Drag & Drop your novel, screenplay,
                    manga or fanfiction.
                </p>

                <span>

                    Supported Files

                    <strong>
                        TXT • PDF • DOCX • EPUB
                    </strong>

                </span>

                <label className="upload-button">

                    <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx,.epub"
                        hidden
                        onChange={handleFileChange}
                    />

                    {selectedFile ? "Change File" : "Choose File"}

                </label>
                {selectedFile && (

                    <div className="file-info">

                        <p className="file-name">
                            📄 {selectedFile.name}
                        </p>

                        <span className="upload-status">
                            {isUploading
                                ? `Uploading... ${progress}%`
                                : "✅ Ready for AI Analysis"}
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

                            <AIProcessing
                                currentStep={currentStep}
                            />

                        )}

                        {showResults && (
                            <button
                                onClick={handleStartCreating}
                                disabled={loading || checkingDuplicate}
                                className="upload-button"
                            >
                                {checkingDuplicate ? "Checking..." : loading ? "Generating..." : "Start Creating 🚀"}
                            </button>
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
                            <button onClick={() => openExistingProject("manhwa")}>
                                📖 View Existing (Manhwa)
                            </button>
                            <button onClick={() => openExistingProject("classic")}>
                                🎬 View Existing (Classic)
                            </button>
                            <button onClick={generateNewAnyway}>
                                ✨ Generate New Version Anyway
                            </button>
                            <button className="duplicate-cancel" onClick={() => setDuplicateMatch(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}

export default UploadSection;
