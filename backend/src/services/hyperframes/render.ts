import { generateFrames } from "./frame_generator";
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

  const hasImageKey = !!(process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY);
  if (!hasImageKey) {
    warnings.push(
      "未配置 IMAGE_API_KEY / OPENAI_API_KEY，已使用占位图（非真实 AI 绘图）。请在 .env 配置后重试。"
    );
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
