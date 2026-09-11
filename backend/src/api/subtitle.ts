import { Router } from "express";
import { db } from "../lib/db";
import { processSubtitleContent } from "../lib/subtitle-utils";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { rawText, type, content } = req.body;

    let processed: { rawText: string; type: string };
    if (content) {
      processed = processSubtitleContent(content, type || "txt");
    } else if (rawText) {
      processed = processSubtitleContent(rawText, type || "txt");
    } else {
      return res.status(400).json({ error: "rawText or content is required" });
    }

    const subtitle = db.subtitle.create({
      rawText: processed.rawText,
      type: processed.type,
    });

    res.json(subtitle);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/", async (_req, res) => {
  try {
    res.json(db.subtitle.findMany());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const subtitle = db.subtitle.findUnique({ id: req.params.id });
    if (!subtitle) return res.status(404).json({ error: "Not found" });
    res.json(subtitle);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
