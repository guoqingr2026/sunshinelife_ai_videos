import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { resolveMediaPathForManim } from "./media-path";
import { getStorageRoot } from "./storage";

const COMPOSE_FPS = 30;

export interface MaterializableTimelineItem {
  type: string;
  durationInFrames?: number;
  title?: string;
  sourceUrl?: string;
  params?: Record<string, unknown>;
  manimType?: string;
}

function hexToFfmpegPadColor(hex?: string): string {
  const h = String(hex || "").replace("#", "").trim();
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `0x${h}`;
  return "0x141420";
}

export function rasterizeImageToMp4(
  imageAbsPath: string,
  outputMp4: string,
  durationSeconds: number,
  backgroundColor?: string
): Promise<void> {
  fs.mkdirSync(path.dirname(outputMp4), { recursive: true });
  const padColor = hexToFfmpegPadColor(backgroundColor);
  const duration = Math.max(0.5, durationSeconds);
  const vf = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${padColor}`;

  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      [
        "-y",
        "-loop",
        "1",
        "-framerate",
        String(COMPOSE_FPS),
        "-i",
        imageAbsPath,
        "-t",
        String(duration),
        "-vf",
        vf,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        outputMp4,
      ],
      { shell: true }
    );

    let stderr = "";
    proc.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outputMp4)) resolve();
      else reject(new Error(`ffmpeg image→mp4 failed (code=${code}): ${stderr.slice(-500)}`));
    });
    proc.on("error", (err) => reject(err));
  });
}

/**
 * Convert image_clip slots to manim_clip + MP4 via ffmpeg.
 * Remotion <Video> is reliable on ECS; <Img> is not.
 */
export async function materializeImageClipsInTimeline(
  taskId: string,
  timeline: MaterializableTimelineItem[],
  toMediaUrl: (relPath: string) => string,
  backgroundColor?: string
): Promise<MaterializableTimelineItem[]> {
  const outDir = path.join(getStorageRoot(), "files", "remotion");
  fs.mkdirSync(outDir, { recursive: true });

  const result: MaterializableTimelineItem[] = [];
  let imgIndex = 0;

  for (const item of timeline) {
    if (item.type !== "image_clip") {
      result.push(item);
      continue;
    }

    const imagePath =
      (item.params?.imagePath as string) ||
      (item.params?.url as string) ||
      item.sourceUrl ||
      "";
    const abs = resolveMediaPathForManim(imagePath);
    if (!path.isAbsolute(abs) || !fs.existsSync(abs)) {
      throw new Error(
        `image_clip「${item.title || "未命名"}」找不到图片：${imagePath}`
      );
    }

    const frames =
      typeof item.durationInFrames === "number" && item.durationInFrames > 0
        ? item.durationInFrames
        : 150;
    const fileName = `${taskId}-img${imgIndex}.mp4`;
    const outPath = path.join(outDir, fileName);

    await rasterizeImageToMp4(abs, outPath, frames / COMPOSE_FPS, backgroundColor);

    result.push({
      type: "manim_clip",
      durationInFrames: frames,
      title: item.title,
      sourceUrl: toMediaUrl(`files/remotion/${fileName}`),
      manimType: "image_clip",
    });
    imgIndex++;
  }

  return result;
}
