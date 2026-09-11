import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

router.get("/templates", (_req, res) => {
  try {
    res.json(db.remotionTemplate.findMany());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/templates", (req, res) => {
  try {
    const { name, templateId, timeline, theme } = req.body;
    if (!name || !timeline) {
      return res.status(400).json({ error: "name and timeline are required" });
    }
    const item = db.remotionTemplate.create({
      name,
      templateId: templateId || "simple-electric",
      timeline: JSON.stringify(timeline),
      theme: JSON.stringify(theme || {}),
    });
    res.json({
      ...item,
      timeline: JSON.parse(item.timeline),
      theme: JSON.parse(item.theme),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/templates/:id", (req, res) => {
  try {
    db.remotionTemplate.delete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
