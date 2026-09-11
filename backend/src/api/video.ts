import { Router } from "express";
import { db } from "../lib/db";
import { planFromBrief } from "../services/video/plan-timeline";

const router = Router();

router.post("/plan", (req, res) => {
  try {
    const { brief, title } = req.body;
    if (!brief || typeof brief !== "string") {
      return res.status(400).json({ error: "brief is required" });
    }
    const plan = planFromBrief(brief, title);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/compose", (req, res) => {
  try {
    const { brief, title, preview, renderFinal, theme, templateId } = req.body;
    if (!brief || typeof brief !== "string") {
      return res.status(400).json({ error: "brief is required" });
    }

    const task = db.task.create({
      kind: "compose",
      status: "pending",
      payload: JSON.stringify({
        brief,
        title,
        preview: preview ?? true,
        renderFinal: renderFinal !== false,
        theme,
        templateId: templateId || "simple-electric",
        phase: "pending",
        progress: "排队中…",
      }),
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

router.get("/compose/:id", (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id, kind: "compose" });
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
