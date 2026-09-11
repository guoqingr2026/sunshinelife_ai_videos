import { Router } from "express";
import fs from "fs";
import path from "path";
import { db } from "../lib/db";
import { checkCmd, checkManimModule, checkPythonAvailable } from "../lib/python";
import { getManimOutputPath } from "../lib/storage";

const router = Router();

router.get("/status", async (_req, res) => {
  const manimOk = await checkManimModule();
  const pythonOk = await checkPythonAvailable();
  const ffmpegOk = await checkCmd("ffmpeg", ["-version"]);

  const recent = db.task
    .findMany({ kind: "manim" })
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      status: t.status,
      outputUrl: t.outputUrl,
      type: JSON.parse(t.payload).type,
      createdAt: t.createdAt,
    }));

  res.json({
    manimInstalled: manimOk,
    pythonInstalled: pythonOk,
    ffmpegInstalled: ffmpegOk,
    mode: manimOk ? "real" : "placeholder",
    hint: manimOk
      ? "支持 24+ 种场景：工程示意、数学图表、信息图、文本动画、结构轨道"
      : "未检测到 Manim，将生成占位视频。安装: py -3 -m pip install manim",
    recentTasks: recent,
  });
});

router.post("/task", async (req, res) => {
  try {
    const { type, params, subtitleId } = req.body;
    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    const task = db.task.create({
      kind: "manim",
      status: "pending",
      payload: JSON.stringify({ type, params, subtitleId }),
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
    const task = db.task.findFirst({ id: req.params.id, kind: "manim" });
    if (!task) return res.status(404).json({ error: "Not found" });

    const logPath = getManimOutputPath(req.params.id).replace(/\.mp4$/, ".log");
    let renderLog: string | undefined;
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, "utf-8");
      renderLog = raw.slice(-4000);
    }

    res.json({
      ...task,
      payload: JSON.parse(task.payload),
      renderLog,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
