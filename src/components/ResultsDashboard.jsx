import "../styles/ResultsDashboard.css";
import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AnimatedNumber({ value, delay = 0 }) {

    const [display, setDisplay] = useState(0);

    useEffect(() => {

        const timer = setTimeout(() => {

            const controls = animate(0, value, {

                duration: 0.8,

                onUpdate(latest) {

                    setDisplay(Math.floor(latest));

                }

            });

            return () => controls.stop();

        }, delay * 1000);

        return () => clearTimeout(timer);

    }, [value, delay]);

    return <span>{display}</span>;

}

function ResultsDashboard({ onOpenStoryboard }) {
    const navigate = useNavigate();
    const stats = [

        {
            icon: "👥",
            value: 14,
            label: "Characters",
            subtitle: "Detected"
        },

        {
            icon: "🎬",
            value: 28,
            label: "Scenes",
            subtitle: "Generated"
        },

        {
            icon: "🖼️",
            value: 28,
            label: "Storyboards",
            subtitle: "Created"
        },

        {
            icon: "⏱️",
            value: 19,
            suffix: "s",
            label: "Processing Time",
            subtitle: "Completed"
        }

    ];

    return (

        <motion.section
            className="results-dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >

            <h2>✨ Analysis Complete!</h2>

            <p>
                Your story has been successfully analyzed.
            </p>

            <div className="stats-grid">

                {stats.map((stat, index) => (

                    <motion.div
                        key={index}
                        className="stat-card"
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: index * 0.15,
                            duration: 0.5
                        }}
                    >

                        <div className="stat-header">

                            <div className="stat-icon">
                                {stat.icon}
                            </div>

                            <div className="stat-label">
                                {stat.label}
                            </div>

                        </div>

                        <h3 className="stat-number">

                            <AnimatedNumber value={stat.value} />

                            {stat.suffix && (
                                <span className="suffix">
                                    {stat.suffix}
                                </span>
                            )}

                        </h3>

                        <p className="stat-subtitle">
                            {stat.subtitle}
                        </p>

                    </motion.div>

                ))}

            </div>
            <button
                className="export-btn"
                onClick={() => navigate("/viewer")}
            >
                🚀 Open Storyboard
            </button>

        </motion.section>

    );

}

export default ResultsDashboard;