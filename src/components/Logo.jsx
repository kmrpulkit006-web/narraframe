import { motion } from "framer-motion";
import "../styles/Logo.css";

function Logo() {

    return (

        <motion.div
            className="logo"
            whileHover={{
                rotate: -5,
                scale: 1.05
            }}
            transition={{
                duration: 0.25
            }}
        >

            <svg
                width="46"
                height="46"
                viewBox="0 0 46 46"
            >

                <defs>

                    <linearGradient
                        id="logoGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >

                        <stop
                            offset="0%"
                            stopColor="#8B5CF6"
                        />

                        <stop
                            offset="100%"
                            stopColor="#06B6D4"
                        />

                    </linearGradient>

                </defs>

                <rect
                    x="3"
                    y="3"
                    width="40"
                    height="40"
                    rx="10"
                    fill="none"
                    stroke="url(#logoGradient)"
                    strokeWidth="2"
                />

                <rect
                    x="9"
                    y="9"
                    width="10"
                    height="10"
                    rx="2"
                    fill="url(#logoGradient)"
                />

                <rect
                    x="9"
                    y="24"
                    width="10"
                    height="10"
                    rx="2"
                    fill="url(#logoGradient)"
                />

                <rect
                    x="24"
                    y="24"
                    width="10"
                    height="10"
                    rx="2"
                    fill="url(#logoGradient)"
                />

                <motion.g
                    animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.5
                    }}
                >

                    <path
                        d="M29 8 L31 13 L36 15 L31 17 L29 22 L27 17 L22 15 L27 13 Z"
                        fill="#FFD54F"
                    />

                </motion.g>

            </svg>

            <span>

                NarraFrame

            </span>

        </motion.div>

    );

}

export default Logo;