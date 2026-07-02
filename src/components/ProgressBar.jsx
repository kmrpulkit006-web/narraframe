import { motion } from "framer-motion";
import "../styles/ProgressBar.css";

function ProgressBar({
    progress,
    showBurst,
    setShowBurst,
    setIsUploading,
    setIsAnalyzing
}) {
    return (
        <div className="progress-container">

            <motion.div
                className="progress-fill"
                style={{
                    width: `${progress}%`
                }}
                animate={
                    showBurst
                        ? {
                            scale: [1, 1.08, 0],
                            opacity: [1, 1, 0],
                            rotate: [0, -2, 2, 0]
                        }
                        : {}
                }
                transition={{
                    duration: 0.6
                }}
                onAnimationComplete={() => {

                    if (showBurst) {

                        setShowBurst(false);
                        setIsUploading(false);
                        setIsAnalyzing(true);

                    }

                }}
            >

                <div className="wave-wrapper">

                    <svg
                        className="wave"
                        viewBox="0 0 120 20"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="
                            M0,10
                            C10,2 20,18 30,10
                            S50,2 60,10
                            S80,18 90,10
                            S110,2 120,10
                            L120,20
                            L0,20
                            Z"
                        />
                    </svg>

                </div>

            </motion.div>

        </div>
    );
}

export default ProgressBar;