import { Router } from "express";
import fs from "fs";
import path from "path";
import { db } from "../lib/db";
import { checkCmd, checkManimModule, checkPythonAvailable } from "../lib/python";
import { getManimOutputPath } from "../lib/storage";

const router = Router();

type SceneExample = {
  type: string;
  label: string;
  params: Record<string, unknown>;
};

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
    res.json({ types, locale, customTypes: ["custom_python", "manim_custom", "formula_curve"] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

function loadSceneExamples(manimRoot: string) {
  const examplesPath = path.join(manimRoot, "scene_examples.json");
  const officialPath = path.join(manimRoot, "official_custom_examples.json");
  const categories: Array<{ id: string; label: string }> = [];
  const examples: SceneExample[] = [];
  const seenCat = new Set<string>();

  const mergeFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        if (c?.id && !seenCat.has(c.id)) {
          seenCat.add(c.id);
          categories.push(c);
        }
      }
    }
    if (Array.isArray(data.examples)) {
      examples.push(...(data.examples as SceneExample[]));
    }
  };

  mergeFile(examplesPath);
  mergeFile(officialPath);

  return { categories, examples };
}

router.get("/examples", (_req, res) => {
  try {
    const manimRoot = path.resolve(__dirname, "../../../manim");
    res.json(loadSceneExamples(manimRoot));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/universe-scenes", (_req, res) => {
  try {
    const manimRoot = path.resolve(__dirname, "../../../manim");
    const registryPath = path.join(manimRoot, "templates", "math_universe", "registry.py");
    const raw = fs.readFileSync(registryPath, "utf-8");
    const scenes = [
      ...raw.matchAll(/^\s*"([A-Za-z][A-Za-z0-9_]*)":\s*"templates\./gm),
    ].map((m) => m[1]);
    const aliases = [
      ...raw.matchAll(/^\s*"([a-z_][a-z0-9_]*)":\s*"([A-Za-z][A-Za-z0-9_]*)"/gm),
    ].map((m) => ({ alias: m[1], scene: m[2] }));
    const { categories, examples } = loadSceneExamples(manimRoot);
    const exampleShots = examples.map((ex) => ({
      type: ex.type,
      label: ex.label,
      params: ex.params,
    }));
    res.json({
      scenes,
      aliases,
      categories,
      examples,
      usage: {
        type: "manim_custom",
        params: { scene: "CardioidScene", title: "心形线", subtitle: "r = 1 - cos θ" },
      },
      exampleShots,
    });
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
      ? "注册场景 + manim_custom（数学宇宙）+ custom_python（L3）。GET /api/manim/universe-scenes 列出 scene 名。可选: install-texlive-optional.sh、install-opengl-deps.sh（3D）。"
      : "未检测到 Manim，将生成占位视频。本地: pip install manim · ECS: deploy/ecs/update-manim.sh",
    recentTasks: recent,
  });
});

router.post("/task", async (req, res) => {
  try {
    const { type, params, subtitleId, manimCjkFont } = req.body;
    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    const task = db.task.create({
      kind: "manim",
      status: "pending",
      payload: JSON.stringify({ type, params, subtitleId, manimCjkFont }),
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
