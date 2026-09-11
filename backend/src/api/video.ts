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

    const willRenderFinal = renderFinal !== false;
    const task = db.task.create({
      kind: "compose",
      status: "pending",
      payload: JSON.stringify({
        brief,
        title,
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

export default router;
