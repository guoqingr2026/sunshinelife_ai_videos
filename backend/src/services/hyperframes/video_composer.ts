import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function composeVideo(
  framesDir: string,
  outputPath: string,
  fps: number
): Promise<void> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const inputPattern = path.join(framesDir, "frame_%04d.png");

  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      inputPattern,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath,
    ];

    const proc = spawn("ffmpeg", args, { shell: true });
    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg failed (code ${code}): ${stderr.slice(-500)}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`ffmpeg not found: ${err.message}`));
    });
  });
}
