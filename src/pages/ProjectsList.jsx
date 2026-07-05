import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects, deleteProject } from "../utils/db";
import "../styles/ProjectsList.css";
import { Link } from "react-router-dom";
import { isLoggedIn, getUser } from "../utils/auth";

function ProjectsList() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        setLoading(true);
        try {
            if (isLoggedIn()) {
                const user = getUser();
                const all = await getAllProjects(user?.id);
                setProjects(all);
            } else {
                setProjects([]);
            }
        } catch (err) {
            console.error("Failed to load projects:", err);
        } finally {
            setLoading(false);
        }
    }

    function openProject(project, view) {
        localStorage.setItem("storyboard", JSON.stringify(project.data));
        navigate(view === "manhwa" ? "/manhwa" : "/viewer");
    }

    async function handleDelete(e, id) {
        e.stopPropagation();
        if (!window.confirm("Delete this project? This can't be undone.")) return;

        try {
            await deleteProject(id);
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Failed to delete project:", err);
        }
    }

    return (
        <div className="projects-page">
            <div className="projects-header">
                <h1>My Projects</h1>
                <button className="back-home-btn" onClick={() => navigate("/")}>
                    ← Home
                </button>
            </div>

            {loading ? (
                <p className="projects-empty">Loading...</p>
            ) : !isLoggedIn() ? (
                <p className="projects-empty">
                    Log in to save your generated stories here.{" "}
                    <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link> — it's optional, you can keep generating stories without an account, they just won't be saved to a library.
                </p>
            ) : projects.length === 0 ? (
                <p className="projects-empty">No saved projects yet. Generate a story to see it here.</p>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => (
                        <div key={project.id} className="project-card">
                            <h3>{project.project}</h3>
                            <p>{project.sceneCount} scenes • {new Date(project.savedAt).toLocaleString()}</p>

                            <div className="project-card-actions">
                                <button onClick={() => openProject(project, "manhwa")}>
                                    📖 Manhwa View
                                </button>

                                <button onClick={() => openProject(project, "classic")}>
                                    🎬 Classic View
                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={(e) => handleDelete(e, project.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectsList;