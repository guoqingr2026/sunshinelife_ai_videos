import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { checkManimModule, spawnPythonStdin } from "../../lib/python";
import { getManimOutputPath, toPublicUrl } from "../../lib/storage";
import { isPlayableMp4 } from "../../lib/video-utils";

const MANIM_ROOT = path.resolve(__dirname, "../../../../manim");
const RENDER_SCRIPT = path.join(MANIM_ROOT, "render_task.py");

export interface ManimPayload {
  type: string;
  params?: Record<string, unknown>;
  subtitleId?: string;
}

export interface ManimRenderResult {
  outputUrl: string;
  mode: "real" | "mock";
  warning?: string;
}

export async function renderManim(
  taskId: string,
  payload: ManimPayload
): Promise<ManimRenderResult> {
  const outputPath = getManimOutputPath(taskId);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const manimAvailable = await checkManimModule();

  if (!manimAvailable) {
    await createMockVideo(outputPath);
    if (!isPlayableMp4(outputPath)) {
      throw new Error(
        "Manim 未安装且占位视频生成失败。请在 ECS 执行: apt install ffmpeg && pip install manim"
      );
    }
    return {
      outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`),
      mode: "mock",
      warning: "Manim 未安装，输出为占位视频",
    };
  }

  const payloadJson = JSON.stringify({ taskId, ...payload, outputPath });
  let stderr = "";

  const exitCode = await new Promise<number>((resolve, reject) => {
    const proc = spawnPythonStdin(RENDER_SCRIPT, payloadJson, {
      cwd: MANIM_ROOT,
    });

    proc.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    proc.stdout?.on("data", (d) => {
      void d.toString();
    });

    proc.on("close", (code) => resolve(code ?? 1));
    proc.on("error", (err) => reject(err));
  });

  if (exitCode !== 0 || !isPlayableMp4(outputPath)) {
    const logPath = path.join(path.dirname(outputPath), `${taskId}.log`);
    fs.writeFileSync(
      logPath,
      `exitCode=${exitCode}\n\n${stderr.slice(-8000)}`,
      "utf-8"
    );
    await createMockVideo(outputPath);
    if (!isPlayableMp4(outputPath)) {
      throw new Error(
        `Manim 渲染失败 (code=${exitCode})。日志: files/manim/${taskId}.log`
      );
    }
    return {
      outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`),
      mode: "mock",
      warning: `Manim 渲染失败，已生成占位视频。详见 files/manim/${taskId}.log`,
    };
  }

  return {
    outputUrl: toPublicUrl(`files/manim/${taskId}.mp4`),
    mode: "real",
  };
}

async function createMockVideo(outputPath: string): Promise<void> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x1a1a2e:s=1280x720:d=3",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      { shell: true }
    );

    proc.on("close", (code) => {
      if (code === 0 && isPlayableMp4(outputPath)) resolve();
      else reject(new Error(`ffmpeg mock failed (code=${code})`));
    });
    proc.on("error", (err) => reject(err));
  });
}
