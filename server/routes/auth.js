import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../utils/userStore.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters." });
        }

        const existing = findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
            email,
            passwordHash,
            createdAt: Date.now()
        };

        createUser(user);

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.json({ token, user: { id: user.id, email: user.email } });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Something went wrong during signup." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.json({ token, user: { id: user.id, email: user.email } });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Something went wrong during login." });
    }
});

export default router;