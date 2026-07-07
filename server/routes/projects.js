import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { projectStore } from "../utils/projectStore.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
    try {
        const projects = await projectStore.listProjects(req.userId);
        res.json(projects);
    } catch (error) {
        console.error("List projects error:", error);
        res.status(500).json({ error: "Failed to load projects." });
    }
});

router.post("/", requireAuth, async (req, res) => {
    try {
        const { storyboard } = req.body;
        if (!storyboard) {
            return res.status(400).json({ error: "Storyboard data is required." });
        }

        const project = await projectStore.createProject({
            userId: req.userId,
            project: storyboard.project || "Untitled Project",
            sceneCount: storyboard.scenes ? storyboard.scenes.length : 0,
            data: storyboard
        });

        res.json(project);
    } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({ error: "Failed to save project." });
    }
});

router.put("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.body;

        const updated = await projectStore.updateProject(id, req.userId, {
            data,
            sceneCount: data?.scenes ? data.scenes.length : 0,
            project: data?.project || "Untitled Project"
        });

        if (!updated) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.json(updated);
    } catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({ error: "Failed to update project." });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await projectStore.deleteProject(id, req.userId);

        if (!deleted) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Delete project error:", error);
        res.status(500).json({ error: "Failed to delete project." });
    }
});

export default router;
