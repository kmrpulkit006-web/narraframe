import { buildApiUrl } from "./api";
import { getToken } from "./auth";

async function authFetch(url, options = {}) {
    const token = getToken();
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });
}

export async function updateProjectData(id, data) {
    const res = await authFetch(buildApiUrl(`/projects/${id}`), {
        method: "PUT",
        body: JSON.stringify({ data })
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to update project");
    }

    return true;
}

export async function saveProject(storyboard, userId) {
    const res = await authFetch(buildApiUrl("/projects"), {
        method: "POST",
        body: JSON.stringify({ storyboard, userId })
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save project");
    }

    const record = await res.json();
    return record.id;
}

export async function getAllProjects(userId) {
    const res = await authFetch(buildApiUrl("/projects"));

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to load projects");
    }

    const projects = await res.json();
    return projects.filter((project) => project.userId === userId).sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteProject(id) {
    const res = await authFetch(buildApiUrl(`/projects/${id}`), {
        method: "DELETE"
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to delete project");
    }

    return true;
}