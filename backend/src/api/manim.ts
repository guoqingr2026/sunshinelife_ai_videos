import { Router } from "express";
import fs from "fs";
import path from "path";
import { db } from "../lib/db";
import { checkCmd, checkManimModule, checkPythonAvailable } from "../lib/python";
import { getManimOutputPath } from "../lib/storage";

const router = Router();

router.get("/catalog", (_req, res) => {
  try {
    const manimRoot = path.resolve(__dirname, "../../../manim");
    const localePath = path.join(manimRoot, "locale", "zh.json");
    const locale = fs.existsSync(localePath)
      ? JSON.parse(fs.readFileSync(localePath, "utf-8"))
      : {};
    const catalogPath = path.join(manimRoot, "template_catalog.py");
    const raw = fs.readFileSync(catalogPath, "utf-8");
    const types = [...raw.matchAll(/"([a-z_]+)":\s*"templates\./g)].map((m) => m[1]);
    res.json({ types, locale, customTypes: ["custom_python"] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

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
      ? "42 种注册场景 + custom_python（L3）。可选: install-texlive-optional.sh（MathTex）、install-opengl-deps.sh（3D）。手册: docs/manim-automation-guide.md"
      : "未检测到 Manim，将生成占位视频。本地: pip install manim · ECS: deploy/ecs/update-manim.sh",
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

    const basePath = getManimOutputPath(req.params.id).replace(/\.mp4$/, "");
    const logPath = `${basePath}.log`;
    const jsonPath = `${basePath}.json`;
    let renderLog: string | undefined;
    let clipJson: Record<string, unknown> | undefined;
    let clipJsonUrl: string | undefined;
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, "utf-8");
      renderLog = raw.slice(-4000);
    }
    if (fs.existsSync(jsonPath)) {
      clipJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      clipJsonUrl = `/files/manim/${req.params.id}.json`;
    }

    res.json({
      ...task,
      payload: JSON.parse(task.payload),
      renderLog,
      clipJson,
      clipJsonUrl,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
