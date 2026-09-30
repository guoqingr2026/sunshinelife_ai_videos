import { Router } from "express";
import { spawn } from "child_process";
import { db } from "../lib/db";
import { getImageApiConfig } from "../services/hyperframes/image_client";
import { getLlmConfigStatus } from "../services/llm/openrouter-chat";

const router = Router();

async function checkFfmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"], { shell: true });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

router.get("/status", async (_req, res) => {
  const img = getImageApiConfig();
  const llm = getLlmConfigStatus();
  const imageApiConfigured = !!img.imageApiKey;
  const ffmpegAvailable = await checkFfmpeg();

  const hints: string[] = [];
  if (!imageApiConfigured) {
    hints.push(
      "未配置 OPENROUTER_API_KEY / IMAGE_API_KEY：将生成 8×8 占位图。请在 .env 设置 OPENROUTER_API_KEY（推荐）后 pm2 restart。"
    );
  } else if (img.provider === "openrouter") {
    hints.push(
      `图像 API：OpenRouter（与 AI 选题同一 Key）· 模型 ${img.imageModel}。可在 .env 设置 OPENROUTER_IMAGE_MODEL 更换。`
    );
  }
  if (!ffmpegAvailable) {
    hints.push("未检测到 ffmpeg：帧序列可生成，但无法合成 MP4。请执行 apt install -y ffmpeg");
  }
  if (imageApiConfigured && ffmpegAvailable) {
    hints.push("环境就绪。多帧将多次调用图像 API，请留意 OpenRouter 额度。");
  }

  res.json({
    imageApiConfigured,
    imageModel: img.imageModel,
    imageProvider: img.provider,
    llmConfigured: llm.configured,
    ffmpegAvailable,
    hints,
    ready: imageApiConfigured && ffmpegAvailable,
  });
});

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
