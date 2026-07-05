import "../styles/StoryboardViewer.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";





function StoryboardViewer({ storyboard }) {



    let savedStoryboard = null;
    try {
        const raw = localStorage.getItem("storyboard");
        savedStoryboard = raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error("Failed to parse saved storyboard:", err);
    }

    storyboard = storyboard || savedStoryboard;
    const navigate = useNavigate();
    const [currentScene, setCurrentScene] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [currentScene]);

    if (!storyboard) {
        return <div style={{ color: "white", padding: "40px" }}>No storyboard found</div>;
    }

    return (

        <div className="viewer">

            <aside className="sidebar">
                <button
                    className="back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back
                </button>

                <h2>NarraFrame</h2>

                {storyboard.scenes.map((scene, index) => (
                    <div
                        key={scene.id}
                        className={`scene ${currentScene === index ? "active" : ""}`}
                        onClick={() => setCurrentScene(index)}
                    >
                        🎬 {scene.title}
                    </div>
                ))}

            </aside>

            <main className="workspace">

                <div className="topbar">

                    <div>

                        <h1>Project: {storyboard.project}</h1>

                        <p>{storyboard.scenes.length} Scenes • Generated just now</p>

                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            className="export-btn"
                            onClick={() => navigate("/manhwa")}
                        >
                            📖 Manhwa View
                        </button>

                        <button className="export-btn" onClick={() => window.print()}>
                            Export PDF
                        </button>
                    </div>

                </div>

                <motion.div
                    className="canvas"
                    key={currentScene}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >

                    <div className="storyboard-frame">

                        <div className="frame-image">

                            {storyboard.scenes[currentScene].image && !imageFailed ? (
                                <img
                                    src={storyboard.scenes[currentScene].image}
                                    alt="Scene"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                        console.error("Image failed to load:", e.target.src);
                                        setImageFailed(true);
                                    }}
                                />
                            ) : (
                                "🎬"
                            )}

                            {storyboard.scenes[currentScene].dialogue &&
                                storyboard.scenes[currentScene].dialogue.filter(d => d.line && d.line.trim() !== "").length > 0 && (
                                    <div className="dialogue-overlay">
                                        {storyboard.scenes[currentScene].dialogue.filter(d => d.line && d.line.trim() !== "").map((line, index) => (
                                            <motion.div
                                                key={index}
                                                className={`speech-bubble ${index % 2 === 0 ? "left" : "right"}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3 + index * 0.25, duration: 0.3 }}
                                            >
                                                <span className="speaker-name">{line.speaker}</span>
                                                <span className="line-text">{line.line}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                        </div>

                        <div className="frame-info">
                            <h3>{storyboard.scenes[currentScene].title}</h3>
                            <p>{storyboard.scenes[currentScene].description}</p>
                        </div>

                    </div>

                </motion.div>

                <motion.div
                    className="details"
                    key={`details-${currentScene}`}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                >

                    <div className="card">

                        <h3>Scene Description</h3>

                        <p>{storyboard.scenes[currentScene].description}</p>

                        <div className="scene-meta">

                            <span>🎥 {storyboard.scenes[currentScene].camera}</span>

                            <span>🌙 {storyboard.scenes[currentScene].mood}</span>

                        </div>

                    </div>

                    <div className="card">

                        <h3>Characters</h3>

                        <ul>
                            {storyboard.scenes[currentScene].characters.map((character) => (
                                <li key={character}>👤 {character}</li>
                            ))}
                        </ul>

                    </div>

                </motion.div>

            </main>

        </div>

    );

}



export default StoryboardViewer;


