import { openDatabase } from "./indexedDB";

const STORE_NAME = "imageCache";

export async function getCachedImage(key) {
    try {
        const db = await openDatabase();

        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result ? request.result.imageUrl : null);
            request.onerror = () => resolve(null);
        });
    } catch (err) {
        console.error("Image cache read failed:", err);
        return null;
    }
}

export async function setCachedImage(key, imageUrl) {
    try {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put({ key, imageUrl, savedAt: Date.now() });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (err) {
        console.error("Image cache write failed:", err);
    }
}

export function buildCacheKey(payload) {
    return JSON.stringify(payload);
}