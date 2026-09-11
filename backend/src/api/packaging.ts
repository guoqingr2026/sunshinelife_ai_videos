import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

/** 仅返回提示词模板，不调用任何 AI API */
router.post("/bilibili/prompt", (req, res) => {
  try {
    const { subtitleId, style = "engineering", text } = req.body;

    let subtitleText = text;
    if (subtitleId) {
      const subtitle = db.subtitle.findUnique({ id: subtitleId });
      if (!subtitle) return res.status(404).json({ error: "Subtitle not found" });
      subtitleText = subtitle.rawText;
    }

    if (!subtitleText?.trim()) {
      return res.status(400).json({ error: "subtitleId or text is required" });
    }

    const styleLabels: Record<string, string> = {
      engineering: "工程科普",
      casual: "轻松有趣",
      academic: "学术严谨",
    };

    const prompt = `你是 B 站科技/工程类视频包装文案专家。请根据以下字幕，写一份可直接使用的视频包装文案。

风格：${styleLabels[style] || style}

需要包含：标题、简介（含话题标签）、前3秒口播钩子、封面大字与封面小字。

字幕内容：
---
${subtitleText.trim()}
---

请直接输出完整文案，分块清晰。`;

    res.json({ prompt });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
