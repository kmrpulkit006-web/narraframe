import "../styles/ManhwaViewer.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { updateProjectData } from "../utils/db";
import { isLoggedIn } from "../utils/auth";
import { buildApiUrl } from "../utils/api";

function loadInitialBoard(storyboard) {
    if (storyboard) return storyboard;

    try {
        const raw = localStorage.getItem("storyboard");
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error("Failed to parse saved storyboard:", err);
        return null;
    }
}

function ManhwaViewer({ storyboard }) {
    const navigate = useNavigate();
    const sceneRefs = useRef([]);
    const [board, setBoard] = useState(() => loadInitialBoard(storyboard));
    const [regeneratingId, setRegeneratingId] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!board) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveIndex(Number(entry.target.dataset.index));
                    }
                });
            },
            { threshold: 0.5 }
        );

        sceneRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [board]);

    if (!board) {
        return <div style={{ color: "white", padding: "40px" }}>No storyboard found</div>;
    }

    const scrollToScene = (index) => {
        sceneRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    async function regenerateScene(sceneIndex) {
        const scene = board.scenes[sceneIndex];
        setRegeneratingId(scene.id);

        const variedSeed = board.seed + Math.floor(Math.random() * 100000) + 1;

        try {
            const res = await fetch(buildApiUrl("/generate-image"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scene,
                    characters: board.characters,
                    seed: variedSeed
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(`Regenerate failed for "${scene.title}":`, data.error);
                return;
            }

            const updatedScenes = board.scenes.map((s, i) =>
                i === sceneIndex ? { ...s, image: data.imageUrl } : s
            );

            const updatedBoard = { ...board, scenes: updatedScenes };
            setBoard(updatedBoard);
            localStorage.setItem("storyboard", JSON.stringify(updatedBoard));

            const projectId = localStorage.getItem("storyboardProjectId");
            if (isLoggedIn() && projectId) {
                try {
                    await updateProjectData(projectId, updatedBoard);
                } catch (err) {
                    console.error("Failed to persist regenerated image to library:", err);
                }
            }

        } catch (err) {
            console.error("Regenerate error:", err);
        } finally {
            setRegeneratingId(null);
        }
    }

    return (
        <div className="viewer">

            <aside className="sidebar">
                <button className="back-btn" onClick={() => navigate("/viewer")}>
                    ← Classic View
                </button>

                <h2>NarraFrame</h2>

                {board.scenes.map((scene, index) => (
                    <div
                        key={scene.id}
                        className={`scene ${activeIndex === index ? "active" : ""}`}
                        onClick={() => scrollToScene(index)}
                    >
                        🎬 {scene.title}
                    </div>
                ))}

            </aside>

            <main className="workspace">

                <div className="topbar">
                    <div>
                        <h1>Project: {board.project}</h1>
                        <p>{board.scenes.length} Scenes • Manhwa View</p>
                    </div>

                    <button className="export-btn" onClick={() => window.print()}>
                        Export PDF
                    </button>
                </div>

                <div className="webtoon-scroll">
                    {board.scenes.map((scene, index) => (
                        <motion.div
                            key={scene.id}
                            ref={(el) => (sceneRefs.current[index] = el)}
                            data-index={index}
                            className="webtoon-panel"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="panel-image">
                                {scene.image ? (
                                    <img
                                        src={scene.image}
                                        alt={scene.title}
                                        onError={(e) => console.error("Image failed to load:", e.target.src)}
                                    />
                                ) : (
                                    "🎬"
                                )}

                                {scene.dialogue && scene.dialogue.filter(d => d.line && d.line.trim() !== "").length > 0 && (
                                    <div className="dialogue-overlay">
                                        {scene.dialogue.filter(d => d.line && d.line.trim() !== "").map((line, i) => (
                                            <motion.div
                                                key={i}
                                                className={`speech-bubble ${i % 2 === 0 ? "left" : "right"}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.3 + i * 0.25, duration: 0.3 }}
                                            >
                                                <span className="speaker-name">{line.speaker}</span>
                                                <span className="line-text">{line.line}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="panel-info">
                                <div className="panel-header-row">
                                    <h3>{scene.title}</h3>

                                    <button
                                        className="regenerate-btn"
                                        disabled={regeneratingId === scene.id}
                                        onClick={() => regenerateScene(index)}
                                    >
                                        {regeneratingId === scene.id ? "Regenerating…" : "🔄 Regenerate"}
                                    </button>
                                </div>

                                {regeneratingId === scene.id && (
                                    <p className="regenerate-note">
                                        ⏳ This can take up to 30 seconds — please don't refresh or navigate away.
                                    </p>
                                )}


                                <p>{scene.description}</p>

                                <div className="scene-meta">
                                    <span>🎥 {scene.camera}</span>
                                    <span>🌙 {scene.mood}</span>
                                </div>

                                {scene.characters && scene.characters.length > 0 && (
                                    <div className="panel-characters">
                                        {scene.characters.map((character) => (
                                            <span key={character} className="character-chip">
                                                👤 {character}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </main>

        </div>
    );
}

export default ManhwaViewer;