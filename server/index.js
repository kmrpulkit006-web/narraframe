import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import storyboardRoute from "./routes/storyboard.js";
import imageRoutes from "./routes/image.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import projectsRoutes from "./routes/projects.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/generated", express.static(path.join(__dirname, "public", "generated")));

app.use(cors({
  origin: ["https://scriptoonai.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use("/storyboard", storyboardRoute);
app.use("/generate-image", imageRoutes);
app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Scriptoon AI API Running 🚀"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});