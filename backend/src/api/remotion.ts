import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

router.post("/task", async (req, res) => {
  try {
    const { templateId, timeline, theme, preview } = req.body;
    if (!templateId || !timeline) {
      return res
        .status(400)
        .json({ error: "templateId and timeline are required" });
    }

    const task = db.task.create({
      kind: "remotion",
      status: "pending",
      payload: JSON.stringify({ templateId, timeline, theme, preview }),
    });

    res.json({
      taskId: task.id,
      status: task.status,
      kind: task.kind,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/task/:id", async (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id, kind: "remotion" });
    if (!task) return res.status(404).json({ error: "Not found" });
    res.json({
      ...task,
      payload: JSON.parse(task.payload),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
