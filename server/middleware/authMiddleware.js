import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        req.userEmail = payload.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
    }
}