import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import storyboardRoute from "./routes/storyboard.js";
import imageRoutes from "./routes/image.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/generated", express.static(path.join(__dirname, "public", "generated")));

app.use(cors());
app.use(express.json());
app.use("/storyboard", storyboardRoute);
app.use("/generate-image", imageRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "NarraFrame API Running 🚀"
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});