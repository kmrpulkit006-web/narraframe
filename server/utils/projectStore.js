import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DEFAULT_PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

let mongoClient = null;
let mongoDb = null;
let mongoInitPromise = null;

function ensureStoreFile(filePath = DEFAULT_PROJECTS_FILE) {
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf-8");
    }
}

function readProjects(filePath = DEFAULT_PROJECTS_FILE) {
    ensureStoreFile(filePath);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}

function writeProjects(projects, filePath = DEFAULT_PROJECTS_FILE) {
    ensureStoreFile(filePath);
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2), "utf-8");
}

async function getMongoCollection() {
    if (mongoDb) {
        return mongoDb.collection("projects");
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI not configured");
    }

    if (!mongoInitPromise) {
        mongoInitPromise = (async () => {
            mongoClient = new MongoClient(process.env.MONGODB_URI);
            await mongoClient.connect();
            mongoDb = mongoClient.db(process.env.MONGODB_DB || "narraframe");
            return mongoDb.collection("projects");
        })();
    }

    return mongoInitPromise.then((collection) => collection);
}

export function createProjectStore(filePath = DEFAULT_PROJECTS_FILE) {
    return {
        async listProjects(userId) {
            try {
                const collection = await getMongoCollection();
                const projects = await collection.find({ userId }).sort({ savedAt: -1 }).toArray();
                return projects.map((project) => ({ ...project, id: project.id || project._id.toString() }));
            } catch (error) {
                const projects = readProjects(filePath);
                return projects
                    .filter((project) => project.userId === userId)
                    .sort((a, b) => b.savedAt - a.savedAt);
            }
        },
        async createProject(input) {
            try {
                const collection = await getMongoCollection();
                const project = {
                    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
                    userId: input.userId || null,
                    project: input.project || "Untitled Project",
                    sceneCount: input.sceneCount ?? 0,
                    savedAt: Date.now(),
                    data: input.data || {}
                };
                await collection.insertOne(project);
                return project;
            } catch (error) {
                const projects = readProjects(filePath);
                const project = {
                    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
                    userId: input.userId || null,
                    project: input.project || "Untitled Project",
                    sceneCount: input.sceneCount ?? 0,
                    savedAt: Date.now(),
                    data: input.data || {}
                };
                projects.push(project);
                writeProjects(projects, filePath);
                return project;
            }
        },
        async updateProject(id, userId, updates) {
            try {
                const collection = await getMongoCollection();
                const updated = {
                    ...updates,
                    id,
                    userId,
                    savedAt: Date.now()
                };
                await collection.updateOne({ id, userId }, { $set: updated });
                const record = await collection.findOne({ id, userId });
                return record ? { ...record, id: record.id || record._id.toString() } : null;
            } catch (error) {
                const projects = readProjects(filePath);
                const index = projects.findIndex((project) => project.id === id && project.userId === userId);

                if (index === -1) {
                    return null;
                }

                const updated = {
                    ...projects[index],
                    ...updates,
                    id,
                    userId,
                    savedAt: Date.now()
                };

                projects[index] = updated;
                writeProjects(projects, filePath);
                return updated;
            }
        },
        async deleteProject(id, userId) {
            try {
                const collection = await getMongoCollection();
                const result = await collection.deleteOne({ id, userId });
                return result.deletedCount > 0;
            } catch (error) {
                const projects = readProjects(filePath);
                const nextProjects = projects.filter((project) => !(project.id === id && project.userId === userId));

                if (nextProjects.length === projects.length) {
                    return false;
                }

                writeProjects(nextProjects, filePath);
                return true;
            }
        }
    };
}

export const projectStore = createProjectStore();
