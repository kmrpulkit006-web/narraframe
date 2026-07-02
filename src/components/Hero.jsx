import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import "./../styles/Hero.css";

function Hero() {
    return (
        <section className="hero">

            <motion.div
                className="hero-tag"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Sparkles size={18} />
                <span>NarraFrame • AI Storyboard Studio</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                Turn Stories Into
                <span> Turn Stories Into
                    Cinematic Storyboards</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Transform Stories into Cinematic Storyboards using AI. Upload your novel, screenplay, manga, or fanfiction and watch NarraFrame bring your imagination to life.
            </motion.p>

            <motion.div
                className="hero-buttons"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <button
                    className="primary-btn"
                    onClick={() => {

                        document
                            .getElementById("upload-section")
                            ?.scrollIntoView({

                                behavior: "smooth"

                            });

                    }}
                >

                    🚀 Start Creating

                </button>
                <button className="secondary-btn">
                    🎥 Watch Demo
                </button>
            </motion.div>

        </section>
    );
}

export default Hero;