import { Router } from "express";
import fs from "fs";
import path from "path";
import { db } from "../lib/db";
import { getStorageRoot } from "../lib/storage";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const kind = req.query.kind as string | undefined;
    const tasks = db.task.findMany(kind ? { kind } : undefined);
    res.json(
      tasks.map((t) => ({
        ...t,
        payload: JSON.parse(t.payload),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id });
    if (!task) return res.status(404).json({ error: "Not found" });
    res.json({
      ...task,
      payload: JSON.parse(task.payload),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id });
    if (!task) return res.status(404).json({ error: "Not found" });

    const storageRoot = getStorageRoot();
    if (task.outputUrl) {
      const altPath = path.join(storageRoot, "..", task.outputUrl.replace(/^\//, ""));
      const directPath = path.join(storageRoot, task.outputUrl.replace(/^\//, ""));
      for (const p of [altPath, directPath]) {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }
    if (task.framesUrl) {
      const framesDir = path.join(
        storageRoot,
        "frames",
        task.framesUrl.replace(/^\/frames\//, "").replace(/\/$/, "")
      );
      if (fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
    }

    db.task.delete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
