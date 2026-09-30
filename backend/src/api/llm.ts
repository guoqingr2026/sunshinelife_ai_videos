import { Router } from "express";
import { chatCompletion, getLlmConfigStatus } from "../services/llm/openrouter-chat";

const router = Router();

router.get("/status", (_req, res) => {
  res.json(getLlmConfigStatus());
});

router.post("/complete", async (req, res) => {
  try {
    const { system, user, model } = req.body as {
      system?: string;
      user?: string;
      model?: string;
    };
    if (!user || typeof user !== "string") {
      return res.status(400).json({ error: "user is required" });
    }
    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (system && typeof system === "string" && system.trim()) {
      messages.push({ role: "system", content: system.trim() });
    }
    messages.push({ role: "user", content: user.trim() });
    const result = await chatCompletion(messages, typeof model === "string" ? model : undefined);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: message });
  }
});

export default router;
