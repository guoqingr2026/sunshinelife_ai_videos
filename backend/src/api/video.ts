import { Router } from "express";
import { db } from "../lib/db";
import { planFromBrief } from "../services/video/plan-timeline";
import { parseShotPlanArticle } from "../services/video/shot-plan-parser";
import {
  getShotPlanConfig,
  saveShotPlanArticle,
  DEFAULT_SHOT_PLAN_ARTICLE,
} from "../services/video/shot-plan-store";
import {
  MANIM_TYPE_SPECS,
  buildGptPrompt,
  buildDefaultShotPlanArticle,
} from "../services/video/shot-plan-spec";
import { initComposeProgress } from "../services/video/compose-progress";
import { buildComposeProjectFromShotPlan } from "../services/video/shot-plan-project";
import { getOutputBundleZipPath } from "../lib/storage";
import fs from "fs";

const router = Router();

router.get("/shot-plan/spec", (_req, res) => {
  res.json({
    types: MANIM_TYPE_SPECS,
    gptPrompt: buildGptPrompt(),
    defaultArticle: buildDefaultShotPlanArticle(),
  });
});

router.get("/shot-plan", (_req, res) => {
  try {
    const config = getShotPlanConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/shot-plan", (req, res) => {
  try {
    const { article } = req.body;
    if (!article || typeof article !== "string") {
      return res.status(400).json({ error: "article is required" });
    }
    const config = saveShotPlanArticle(article);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/shot-plan/project", (_req, res) => {
  try {
    const project = buildComposeProjectFromShotPlan();
    if (!project) {
      return res.status(400).json({
        error: "尚未保存固定镜头序列。请在镜头规划中粘贴 JSON 并点「保存并生效」。",
      });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/shot-plan/preview", (req, res) => {
  try {
    const { article } = req.body;
    const text = typeof article === "string" ? article : DEFAULT_SHOT_PLAN_ARTICLE;
    const parsed = parseShotPlanArticle(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/plan", (req, res) => {
  try {
    const { brief, title, project } = req.body;
    const plan = planFromBrief(
      typeof brief === "string" ? brief : "",
      title,
      project
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/compose", (req, res) => {
  try {
    const { brief, title, project, preview, renderFinal, theme, templateId } = req.body;
    const briefText = typeof brief === "string" ? brief : "";
    if (!briefText.trim() && !project?.shots?.length) {
      return res.status(400).json({ error: "brief or project.shots is required" });
    }

    const willRenderFinal = renderFinal !== false;
    const task = db.task.create({
      kind: "compose",
      status: "pending",
      payload: JSON.stringify({
        brief: briefText,
        title,
        project,
        preview: preview ?? true,
        renderFinal: willRenderFinal,
        theme,
        templateId: templateId || "simple-electric",
      }),
    });

    initComposeProgress(task.id, willRenderFinal);

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

router.get("/compose/:id/bundle", (req, res) => {
  try {
    const task = db.task.findFirst({ id: req.params.id, kind: "compose" });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const zipPath = getOutputBundleZipPath(req.params.id);
    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({ error: "Bundle not ready. Wait for compose to finish." });
    }

    const payload = JSON.parse(task.payload) as { title?: string; project?: { title?: string } };
    const rawTitle = payload.title || payload.project?.title || "video";
    const safeName = rawTitle.replace(/[^\w\u4e00-\u9fff-]+/g, "_").slice(0, 40);
    res.download(zipPath, `output-${safeName}-${req.params.id.slice(0, 8)}.zip`);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
