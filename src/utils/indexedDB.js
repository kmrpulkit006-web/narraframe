const DB_NAME = "narraframe";
const DB_VERSION = 2;

export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("projects")) {
                db.createObjectStore("projects", { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains("imageCache")) {
                db.createObjectStore("imageCache", { keyPath: "key" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}