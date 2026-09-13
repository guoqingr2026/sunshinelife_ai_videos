import { Router } from "express";
import { spawn } from "child_process";
import { db } from "../lib/db";

const router = Router();

async function checkFfmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"], { shell: true });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

router.get("/status", async (_req, res) => {
  const imageApiConfigured = !!(process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY);
  const imageModel = process.env.IMAGE_MODEL || "dall-e-3";
  const ffmpegAvailable = await checkFfmpeg();

  const hints: string[] = [];
  if (!imageApiConfigured) {
    hints.push(
      "未配置 IMAGE_API_KEY 或 OPENAI_API_KEY：将生成 8×8 占位图，画面几乎看不见。请在 .env 中设置后 pm2 restart。"
    );
  }
  if (!ffmpegAvailable) {
    hints.push("未检测到 ffmpeg：帧序列可生成，但无法合成 MP4。请执行 apt install -y ffmpeg");
  }
  if (imageApiConfigured && ffmpegAvailable) {
    hints.push("环境就绪。3 秒 @30fps 约需 7 次图像 API 调用，请留意费用与排队时间。");
  }

  res.json({
    imageApiConfigured,
    imageModel,
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
