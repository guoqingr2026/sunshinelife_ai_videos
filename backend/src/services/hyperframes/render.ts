import { generateFrames } from "./frame_generator";
import { getImageApiConfig } from "./image_client";
import { composeVideo } from "./video_composer";
import {
  getFramesDir,
  getHyperFramesVideoPath,
  toPublicUrl,
} from "../../lib/storage";

export interface HyperFramesPayload {
  prompt: string;
  duration: number;
  fps: number;
  style: "handdrawn" | "ui" | "engineering";
}

export async function renderHyperFrames(
  taskId: string,
  payload: HyperFramesPayload
): Promise<{ outputUrl: string; framesUrl: string; warning?: string }> {
  const framesDir = getFramesDir(taskId);
  const videoPath = getHyperFramesVideoPath(taskId);
  const warnings: string[] = [];

  const { imageApiKey, provider } = getImageApiConfig();
  if (!imageApiKey) {
    warnings.push(
      "未配置 OPENROUTER_API_KEY / IMAGE_API_KEY，已使用占位图。请在 ECS .env 配置 OPENROUTER_API_KEY 后重试。"
    );
  } else if (provider === "openrouter") {
    warnings.push("使用 OpenRouter 图像 API 生成关键帧。");
  }

  await generateFrames(taskId, payload, framesDir);

  let outputUrl = toPublicUrl(`video/${taskId}.mp4`);
  try {
    await composeVideo(framesDir, videoPath, payload.fps);
  } catch (err) {
    console.warn(`ffmpeg unavailable, frames only: ${err}`);
    outputUrl = "";
    warnings.push("ffmpeg 合成失败或未安装，仅生成帧序列目录，无 MP4。请 apt install -y ffmpeg");
  }

  return {
    framesUrl: toPublicUrl(`frames/${taskId}/`),
    outputUrl,
    warning: warnings.length ? warnings.join(" ") : undefined,
  };
}
