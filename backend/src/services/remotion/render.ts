import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { writeMinimalMp4 } from "../../lib/minimal-mp4";
import { getRemotionOutputPath, toPublicUrl } from "../../lib/storage";
import { resolveImageClipsInTimeline } from "../../lib/media-path";
import { normalizeTimeline } from "./normalize-timeline";
import { findBrowserExecutable } from "./browser";

function toRemotionMediaUrl(publicUrl: string): string {
  const port = process.env.PORT || 3001;
  const base = `http://127.0.0.1:${port}`;
  if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
    const filesIdx = publicUrl.indexOf("/files/");
    if (filesIdx >= 0) return `${base}${publicUrl.slice(filesIdx)}`;
    return publicUrl;
  }
  const filesMatch = publicUrl.match(/\/files\/.+$/);
  if (filesMatch) return `${base}${filesMatch[0]}`;
  return `${base}${publicUrl.startsWith("/") ? publicUrl : `/${publicUrl}`}`;
}

const REMOTION_ROOT = path.resolve(__dirname, "../../../../remotion");

export interface TimelineItem {
  type: string;
  durationInFrames?: number;
  sourceUrl?: string;
  title?: string;
  params?: Record<string, unknown>;
}

export interface RemotionPayload {
  templateId: string;
  timeline: TimelineItem[];
  theme?: { primaryColor?: string; font?: string; logoUrl?: string };
  preview?: boolean;
}

function remotionInstalled(): boolean {
  return fs.existsSync(path.join(REMOTION_ROOT, "node_modules", "remotion"));
}

export async function renderRemotion(
  taskId: string,
  payload: RemotionPayload
): Promise<{ outputUrl: string }> {
  const outputPath = path.resolve(getRemotionOutputPath(taskId));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const timeline = resolveImageClipsInTimeline(
    payload.timeline,
    toRemotionMediaUrl
  );
  const normalized = {
    ...payload,
    timeline: normalizeTimeline(timeline),
  };

  const propsFile = path.resolve(
    path.dirname(outputPath),
    `${taskId}-props.json`
  );
  fs.writeFileSync(propsFile, JSON.stringify(normalized));

  const scale = payload.preview ? "0.5" : "1";
  const compositionId = "SimpleElectric";
  let renderError = "";

  if (remotionInstalled()) {
    try {
      await runRemotionCli(propsFile, outputPath, compositionId, scale);
      if (isValidVideo(outputPath)) {
        if (fs.existsSync(propsFile)) fs.unlinkSync(propsFile);
        return { outputUrl: toPublicUrl(`files/remotion/${taskId}.mp4`) };
      }
      renderError = "Remotion 渲染完成但输出文件无效";
    } catch (err) {
      renderError = String(err);
    }
  } else {
    renderError =
      "Remotion 依赖未安装。请在项目根目录执行: pnpm install --filter remotion";
  }

  if (fs.existsSync(propsFile)) fs.unlinkSync(propsFile);

  const ffmpegOk = await tryFfmpegPlaceholder(outputPath, payload.templateId);
  if (ffmpegOk && isValidVideo(outputPath)) {
    console.warn(`Remotion 降级渲染 (${renderError})`);
    return { outputUrl: toPublicUrl(`files/remotion/${taskId}.mp4`) };
  }

  writeMinimalMp4(outputPath);
  if (!isValidVideo(outputPath)) {
    const hint = renderError.includes("ensure-browser")
      ? "未找到 Chrome。请确认已安装 Google Chrome，或设置环境变量 REMOTION_BROWSER_EXECUTABLE。"
      : renderError;
    throw new Error(`视频生成失败: ${hint}`);
  }

  console.warn(`Remotion 使用占位视频 (${renderError})`);
  return { outputUrl: toPublicUrl(`files/remotion/${taskId}.mp4`) };
}

function isValidVideo(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const stat = fs.statSync(filePath);
  return stat.size > 500;
}

function runRemotionCli(
  propsFile: string,
  outputPath: string,
  compositionId: string,
  scale: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const browser = findBrowserExecutable();
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "production",
    };

    if (browser) {
      env.REMOTION_BROWSER_EXECUTABLE = browser;
    }

    const browserArg = browser
      ? ` --browser-executable "${browser.replace(/"/g, '\\"')}"`
      : "";
    const cmd =
      `pnpm exec remotion render src/index.tsx ${compositionId} ` +
      `"${outputPath}" --props="${propsFile}" --scale=${scale}${browserArg}`;

    const proc = spawn(cmd, {
      cwd: REMOTION_ROOT,
      shell: true,
      env,
    });

    let log = "";
    proc.stderr.on("data", (d) => {
      log += d.toString();
    });
    proc.stdout.on("data", (d) => {
      log += d.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else {
        const clean = log.replace(/\x1b\[[0-9;]*m/g, "");
        const logPath = outputPath.replace(/\.mp4$/i, "-remotion.log");
        try {
          fs.writeFileSync(logPath, clean, "utf-8");
        } catch {
          /* ignore */
        }
        reject(
          new Error(
            `Remotion CLI 退出码 ${code}: ${clean.slice(-1200)}` +
              (fs.existsSync(logPath)
                ? ` · 完整日志: ${path.basename(logPath)}`
                : "")
          )
        );
      }
    });
    proc.on("error", (err) => reject(err));
  });
}

async function tryFfmpegPlaceholder(
  outputPath: string,
  templateId: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const label = `Remotion ${templateId}`;
    const proc = spawn(
      "ffmpeg",
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x16213e:s=1280x720:d=8",
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
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
