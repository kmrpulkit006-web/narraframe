import { openDatabase } from "./indexedDB";

const STORE_NAME = "projects";

export async function saveProject(storyboard, userId) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const record = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
            userId: userId || null,
            project: storyboard.project || "Untitled Project",
            sceneCount: storyboard.scenes ? storyboard.scenes.length : 0,
            savedAt: Date.now(),
            data: storyboard
        };

        store.put(record);

        tx.oncomplete = () => resolve(record.id);
        tx.onerror = () => reject(tx.error);
    });
}

export async function getAllProjects(userId) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const filtered = request.result.filter(p => p.userId === userId);
            resolve(filtered.sort((a, b) => b.savedAt - a.savedAt));
        };
        request.onerror = () => reject(request.error);
    });
}

export async function deleteProject(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}