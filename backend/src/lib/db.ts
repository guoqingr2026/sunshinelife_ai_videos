import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getStorageRoot } from "./storage";

export interface Subtitle {
  id: string;
  rawText: string;
  type: string;
  createdAt: string;
}

export interface BilibiliPackaging {
  id: string;
  subtitleId: string;
  title: string;
  description: string;
  hook3s: string;
  coverTitleBig: string;
  coverTitleSmall: string;
  createdAt: string;
}

export interface Task {
  id: string;
  kind: "manim" | "remotion" | "hyperframes" | "compose";
  status: "pending" | "running" | "success" | "failed";
  payload: string;
  outputUrl?: string;
  framesUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemotionTemplate {
  id: string;
  name: string;
  templateId: string;
  timeline: string;
  theme: string;
  createdAt: string;
}

interface Database {
  subtitles: Subtitle[];
  packagings: BilibiliPackaging[];
  tasks: Task[];
  remotionTemplates: RemotionTemplate[];
}

const DB_PATH = path.join(getStorageRoot(), "data.json");

function readDb(): Database {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    }
  } catch {
    // corrupt file, reset
  }
  return { subtitles: [], packagings: [], tasks: [], remotionTemplates: [] };
}

function writeDb(db: Database) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
  subtitle: {
    create(data: { rawText: string; type: string }): Subtitle {
      const dbData = readDb();
      const item: Subtitle = {
        id: uuidv4(),
        rawText: data.rawText,
        type: data.type,
        createdAt: new Date().toISOString(),
      };
      dbData.subtitles.push(item);
      writeDb(dbData);
      return item;
    },
    findMany(): Subtitle[] {
      return readDb().subtitles.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    findUnique(where: { id: string }): Subtitle | null {
      return readDb().subtitles.find((s) => s.id === where.id) || null;
    },
  },

  bilibiliPackaging: {
    create(data: Omit<BilibiliPackaging, "id" | "createdAt">): BilibiliPackaging {
      const dbData = readDb();
      const item: BilibiliPackaging = {
        id: uuidv4(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      dbData.packagings.push(item);
      writeDb(dbData);
      return item;
    },
    findUnique(where: { id: string }): BilibiliPackaging | null {
      return readDb().packagings.find((p) => p.id === where.id) || null;
    },
  },

  task: {
    create(data: {
      kind: string;
      status: string;
      payload: string;
    }): Task {
      const dbData = readDb();
      const now = new Date().toISOString();
      const item: Task = {
        id: uuidv4(),
        kind: data.kind as Task["kind"],
        status: data.status as Task["status"],
        payload: data.payload,
        createdAt: now,
        updatedAt: now,
      };
      dbData.tasks.push(item);
      writeDb(dbData);
      return item;
    },
    findFirst(where: { id?: string; kind?: string; status?: string }): Task | null {
      const tasks = readDb().tasks;
      return (
        tasks.find((t) => {
          if (where.id && t.id !== where.id) return false;
          if (where.kind && t.kind !== where.kind) return false;
          if (where.status && t.status !== where.status) return false;
          return true;
        }) || null
      );
    },
    findMany(opts?: { kind?: string }): Task[] {
      let tasks = readDb().tasks;
      if (opts?.kind) tasks = tasks.filter((t) => t.kind === opts.kind);
      return tasks.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    update(
      where: { id: string },
      data: Partial<
        Pick<Task, "status" | "outputUrl" | "framesUrl" | "error" | "payload">
      >
    ): Task {
      const dbData = readDb();
      const idx = dbData.tasks.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error("Task not found");
      dbData.tasks[idx] = {
        ...dbData.tasks[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(dbData);
      return dbData.tasks[idx];
    },
    delete(where: { id: string }): void {
      const dbData = readDb();
      dbData.tasks = dbData.tasks.filter((t) => t.id !== where.id);
      writeDb(dbData);
    },
  },

  remotionTemplate: {
    create(data: {
      name: string;
      templateId: string;
      timeline: string;
      theme: string;
    }): RemotionTemplate {
      const dbData = readDb();
      if (!dbData.remotionTemplates) dbData.remotionTemplates = [];
      const item: RemotionTemplate = {
        id: uuidv4(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      dbData.remotionTemplates.push(item);
      writeDb(dbData);
      return item;
    },
    findMany(): RemotionTemplate[] {
      const dbData = readDb();
      const list = dbData.remotionTemplates || [];
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    delete(where: { id: string }): void {
      const dbData = readDb();
      dbData.remotionTemplates = (dbData.remotionTemplates || []).filter(
        (t) => t.id !== where.id
      );
      writeDb(dbData);
    },
  },
};
