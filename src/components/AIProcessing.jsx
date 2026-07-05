import { motion } from "framer-motion";
import "../styles/AIProcessing.css";

function AIProcessing({ currentStep }) {

    const stages = [
        {
            id: "reading",
            icon: "📖",
            active: "Reading your story...",
            done: "Story analyzed"
        },
        {
            id: "characters",
            icon: "🎭",
            active: "Detecting characters...",
            done: "14 characters detected"
        },
        {
            id: "scenes",
            icon: "🎬",
            active: "Splitting scenes...",
            done: "28 scenes created"
        },
        {
            id: "storyboard",
            icon: "🖼️",
            active: "Creating storyboard...",
            done: "28 storyboard panels generated"
        },
        {
            id: "render",
            icon: "🎨",
            active: "Rendering animation...",
            done: "Storyboard ready!"
        }
    ];

    return (

        <motion.div
            className="ai-processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >

            <div
                className={`brain ${currentStep >= 4
                    ? "brain-complete"
                    : currentStep >= 2
                        ? "brain-active"
                        : ""
                    }`}
            >
                🧠
            </div>

            <h3>
                {currentStep >= stages.length
                    ? "✨ Analysis Complete!"
                    : "🧠 AI Processing..."}
            </h3>

            <div className="timeline">

                {stages.map((stage, index) => (

                    <div
                        key={index}
                        className={`timeline-item ${index < currentStep ? "done" : ""
                            } ${index === currentStep ? "active" : ""
                            }`}
                    >

                        <div className="timeline-icon">

                            {index < currentStep ? (
                                <div className="check-icon">✓</div>
                            ) : index === currentStep ? (
                                <div className="spinner"></div>
                            ) : (
                                <div className="pending-circle"></div>
                            )}

                        </div>

                        <div className="timeline-text">
                            <>
                                {stage.icon}{" "}
                                {index < currentStep
                                    ? stage.done
                                    : stage.active}
                            </>
                        </div>

                    </div>

                ))}

            </div>

        </motion.div>

    );
}

export default AIProcessing;