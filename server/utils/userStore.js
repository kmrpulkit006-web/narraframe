import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
}

export function getAllUsers() {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw);
}

export function saveAllUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(user) {
    const users = getAllUsers();
    users.push(user);
    saveAllUsers(users);
}