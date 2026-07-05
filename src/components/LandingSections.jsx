import { motion } from "framer-motion";
import "../styles/LandingSections.css";

function LandingSections() {
    return (
        <>
            <section id="features" className="landing-section">
                <h2>Features</h2>
                <p className="section-subtitle">Everything NarraFrame does, built into one flow.</p>

                <div className="feature-grid">
                    <motion.div className="feature-card" whileHover={{ y: -6 }}>
                        <div className="feature-icon">📖</div>
                        <h3>AI Story Analysis</h3>
                        <p>Upload a story and let AI split it into scenes, extract characters, and pull out dialogue automatically.</p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ y: -6 }}>
                        <div className="feature-icon">🎨</div>
                        <h3>Manhwa-Style Art</h3>
                        <p>Every panel is generated in a consistent Korean webtoon art style, with character reference portraits guiding each scene.</p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ y: -6 }}>
                        <div className="feature-icon">💬</div>
                        <h3>Speech Bubbles</h3>
                        <p>Dialogue extracted from your story renders as speech bubbles right on the panel, speaker names included.</p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ y: -6 }}>
                        <div className="feature-icon">📱</div>
                        <h3>Webtoon Reader</h3>
                        <p>Browse your storyboard scene-by-scene, or scroll through it like a real vertical webtoon.</p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ y: -6 }}>
                        <div className="feature-icon">🔄</div>
                        <h3>Per-Panel Regenerate</h3>
                        <p>Not happy with one panel? Regenerate just that scene without redoing the whole story.</p>
                    </motion.div>

                    <motion.div className="feature-card" whileHover={{ y: -6 }}>
                        <div className="feature-icon">📁</div>
                        <h3>Project Library</h3>
                        <p>Log in to save every story you generate and come back to it any time.</p>
                    </motion.div>
                </div>
            </section>

            <section id="examples" className="landing-section">
                <h2>Examples</h2>
                <p className="section-subtitle">A taste of what your story could look like.</p>

                <div className="examples-grid">
                    <div className="example-card">
                        <div className="example-emoji">🌲</div>
                        <h4>Fantasy Adventure</h4>
                        <p>Cliffside treks, hidden temples, and characters who stay visually consistent scene after scene.</p>
                    </div>

                    <div className="example-card">
                        <div className="example-emoji">🕰️</div>
                        <h4>Mystery & Intrigue</h4>
                        <p>Clockwork chambers, tense confrontations, and dialogue-driven storytelling, panel by panel.</p>
                    </div>

                    <div className="example-card">
                        <div className="example-emoji">🌊</div>
                        <h4>Emotional Drama</h4>
                        <p>Quiet, atmospheric scenes with mood-matched lighting that follows your story's tone.</p>
                    </div>
                </div>

                <p className="examples-note">Upload your own story above to generate your first storyboard.</p>
            </section>

            <section id="pricing" className="landing-section">
                <h2>Pricing</h2>
                <p className="section-subtitle">Simple, because it should be.</p>

                <div className="pricing-card">
                    <h3>Free</h3>
                    <p className="pricing-amount">₹0</p>
                    <ul>
                        <li>✓ Unlimited story uploads</li>
                        <li>✓ AI scene & character extraction</li>
                        <li>✓ Manhwa-style panel generation</li>
                        <li>✓ Classic & webtoon viewers</li>
                        <li>✓ Optional free account for saved projects</li>
                    </ul>
                    <p className="pricing-footnote">NarraFrame is a personal project, free to use while in active development.</p>
                </div>
            </section>

            <section id="about" className="landing-section">
                <h2>About</h2>
                <p className="section-subtitle">Why NarraFrame exists.</p>

                <div className="about-content">
                    <p>
                        NarraFrame started as an experiment: what does it take to turn a written story into a manhwa-style
                        storyboard, using free and accessible AI tools? It's still evolving, one feature at a time.
                    </p>
                    <p>
                        Built with React and Express, using AI providers for story analysis and image generation —
                        no paid infrastructure required to use it.
                    </p>
                </div>
            </section>
        </>
    );
}

export default LandingSections;