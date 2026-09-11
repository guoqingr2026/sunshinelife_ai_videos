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
): Promise<{ outputUrl: string; framesUrl: string }> {
  const framesDir = getFramesDir(taskId);
  const videoPath = getHyperFramesVideoPath(taskId);

  await generateFrames(taskId, payload, framesDir);

  let outputUrl = toPublicUrl(`video/${taskId}.mp4`);
  try {
    await composeVideo(framesDir, videoPath, payload.fps);
  } catch (err) {
    console.warn(`ffmpeg unavailable, frames only: ${err}`);
    outputUrl = "";
  }

  return {
    framesUrl: toPublicUrl(`frames/${taskId}/`),
    outputUrl,
  };
}
