import { Router } from "express";
import { db } from "../lib/db";
import { purgeTaskAssets } from "../lib/purge-task-assets";

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

/** 仅删除 ECS 磁盘文件，保留任务记录（归档后释放空间） */
router.post("/:id/purge-assets", async (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id });
    if (!task) return res.status(404).json({ error: "Not found" });
    const removed = purgeTaskAssets(task);
    res.json({ success: true, removedCount: removed.length, removed });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id });
    if (!task) return res.status(404).json({ error: "Not found" });

    const removed = purgeTaskAssets(task);
    db.task.delete({ id: req.params.id });
    res.json({ success: true, removedCount: removed.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
