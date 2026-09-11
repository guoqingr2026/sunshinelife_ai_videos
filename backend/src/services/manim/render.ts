import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { writeMinimalMp4 } from "../../lib/minimal-mp4";
import { checkManimModule, spawnPython } from "../../lib/python";
import { getManimOutputPath, toPublicUrl } from "../../lib/storage";

const MANIM_ROOT = path.resolve(__dirname, "../../../../manim");
const RENDER_SCRIPT = path.join(MANIM_ROOT, "render_task.py");

export interface ManimPayload {
  type: string;
  params?: Record<string, unknown>;
  subtitleId?: string;
}

export async function renderManim(
  taskId: string,
  payload: ManimPayload
): Promise<{ outputUrl: string }> {
  const outputPath = getManimOutputPath(taskId);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const manimAvailable = await checkManimModule();

  if (!manimAvailable) {
    await createMockVideo(outputPath, payload);
    return { outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`) };
  }

  const payloadJson = JSON.stringify({ taskId, ...payload, outputPath });

  return new Promise((resolve, reject) => {
    const proc = spawnPython([RENDER_SCRIPT, payloadJson], {
      cwd: MANIM_ROOT,
    });

    proc.stderr?.on("data", (d) => {
      // stderr logged for debugging if needed
      void d.toString();
    });

    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve({ outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`) });
      } else {
        createMockVideo(outputPath, payload)
          .then(() =>
            resolve({ outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`) })
          )
          .catch(reject);
      }
    });

    proc.on("error", () => {
      createMockVideo(outputPath, payload)
        .then(() =>
          resolve({ outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`) })
        )
        .catch(reject);
    });
  });
}

async function createMockVideo(
  outputPath: string,
  payload: ManimPayload
): Promise<void> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const label = `Manim Mock: ${payload.type}`;
    const proc = spawn(
      "ffmpeg",
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x1a1a2e:s=1280x720:d=3",
        "-vf",
        `drawtext=text='${label}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        outputPath,
      ],
      { shell: true }
    );

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else {
        writeMinimalMp4(outputPath);
        resolve();
      }
    });
    proc.on("error", () => {
      writeMinimalMp4(outputPath);
      resolve();
    });
  });
}
