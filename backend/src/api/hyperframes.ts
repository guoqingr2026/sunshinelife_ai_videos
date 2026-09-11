import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

router.post("/task", async (req, res) => {
  try {
    const { prompt, duration, fps, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const task = db.task.create({
      kind: "hyperframes",
      status: "pending",
      payload: JSON.stringify({
        prompt,
        duration: duration || 3,
        fps: fps || 30,
        style: style || "handdrawn",
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

router.get("/task/:id", async (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id, kind: "hyperframes" });
    if (!task) return res.status(404).json({ error: "Not found" });

    const response: Record<string, unknown> = {
      ...task,
      payload: JSON.parse(task.payload),
    };
    if (task.status === "success") {
      response.framesUrl = task.framesUrl;
      response.videoUrl = task.outputUrl;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
