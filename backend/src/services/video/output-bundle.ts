import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import {
  getManimOutputPath,
  getOutputBundleDir,
  getOutputBundleZipPath,
  getRemotionOutputPath,
  toPublicUrl,
} from "../../lib/storage";
import type { ComposePayload } from "./compose-progress";
import type { TimelineItem } from "./plan-timeline";

const execFileAsync = promisify(execFile);

export interface OutputBundleResult {
  bundleDir: string;
  bundleZipPath: string;
  bundleDirUrl: string;
  bundleZipUrl: string;
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function writeText(filePath: string, text: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, "utf-8");
}

function copyIfExists(src: string, dest: string) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

function buildReadme(taskId: string, payload: ComposePayload, outputUrl?: string): string {
  const title = payload.title || payload.project?.title || "未命名视频";
  const lines = [
    `# ${title}`,
    "",
    "本目录为「一键成片」自动导出的工程包，便于存档、二次开发与本地备份。",
    "",
    "## 目录说明",
    "",
    "| 路径 | 说明 |",
    "|------|------|",
    "| `README.md` | 本说明文件 |",
    "| `manifest.json` | 机器可读元数据（任务 ID、文件列表） |",
    "| `project.json` | 原始分镜 JSON（可再次粘贴到一键成片） |",
    "| `timeline.json` | Remotion 合成用时间轴 |",
    "| `theme.json` | Remotion 配色主题 |",
    "| `workflow.json` | 制作流程、步骤与日志摘要 |",
    "| `script/shots.json` | 解析后的镜头列表 |",
    "| `script/manim-jobs.json` | Manim 渲染任务列表 |",
    "| `assets/final.mp4` | 最终成片（若已合成） |",
    "| `assets/manim/` | 各 Manim 片段 MP4 与 clip JSON |",
    "| `logs/compose.log` | 完整制作日志 |",
    "",
    "## 任务信息",
    "",
    `- 任务 ID: \`${taskId}\``,
    `- 创建时间: ${payload.startedAt || "—"}`,
    `- 完成时间: ${payload.updatedAt || "—"}`,
    `- 合成成片: ${payload.renderFinal !== false ? "是" : "否（仅时间轴+Manim）"}`,
    outputUrl ? `- 成片地址: ${outputUrl}` : "",
    "",
    "## 再次制作",
    "",
    "1. 将 `project.json` 内容粘贴到「一键成片」项目 JSON 框",
    "2. 或修改 `timeline.json` / `theme.json` 后在 Remotion 页单独合成",
    "3. 配色与背景由 Remotion `theme` 控制，Manim 仅提供动画片段",
    "",
    "详见仓库 `docs/manim-automation-guide.md`",
    "",
  ];
  return lines.filter(Boolean).join("\n");
}

/** ZIP 内根目录为 output/，解压即可得到标准工程结构 */
async function zipAsOutputFolder(sourceDir: string, zipPath: string): Promise<void> {
  const stagingParent = path.join(path.dirname(sourceDir), `.zip-staging-${path.basename(sourceDir)}`);
  const stagingOutput = path.join(stagingParent, "output");

  if (fs.existsSync(stagingParent)) {
    fs.rmSync(stagingParent, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingOutput, { recursive: true });
  fs.cpSync(sourceDir, stagingOutput, { recursive: true });

  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  try {
    if (process.platform === "win32") {
      const ps = `Compress-Archive -LiteralPath '${stagingOutput.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`;
      await execFileAsync("powershell", ["-NoProfile", "-Command", ps]);
    } else {
      await execFileAsync("zip", ["-r", zipPath, "output"], { cwd: stagingParent });
    }
  } finally {
    fs.rmSync(stagingParent, { recursive: true, force: true });
  }

  if (!fs.existsSync(zipPath)) {
    throw new Error("ZIP creation failed — install zip (Linux) or use PowerShell (Windows)");
  }
}

export async function createComposeOutputBundle(
  taskId: string,
  payload: ComposePayload,
  timeline: TimelineItem[],
  outputUrl?: string
): Promise<OutputBundleResult> {
  const bundleDir = getOutputBundleDir(taskId);
  const bundleZipPath = getOutputBundleZipPath(taskId);

  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }
  fs.mkdirSync(bundleDir, { recursive: true });

  const title = payload.title || payload.project?.title || "video";

  writeText(path.join(bundleDir, "README.md"), buildReadme(taskId, payload, outputUrl));

  if (payload.project) {
    writeJson(path.join(bundleDir, "project.json"), payload.project);
  } else if (payload.brief?.trim()) {
    writeJson(path.join(bundleDir, "project.json"), { title, brief: payload.brief });
  }

  writeJson(path.join(bundleDir, "timeline.json"), timeline);
  if (payload.theme) {
    writeJson(path.join(bundleDir, "theme.json"), payload.theme);
  }

  writeJson(path.join(bundleDir, "script", "shots.json"), payload.project?.shots || []);
  writeJson(path.join(bundleDir, "script", "manim-jobs.json"), payload.manimJobs || []);

  const workflow = {
    taskId,
    title,
    templateId: payload.templateId,
    preview: payload.preview,
    renderFinal: payload.renderFinal,
    phase: payload.phase,
    steps: payload.steps,
    manimTotal: payload.manimTotal,
    manimResults: payload.manimResults,
    startedAt: payload.startedAt,
    completedAt: payload.updatedAt,
    outputUrl,
  };
  writeJson(path.join(bundleDir, "workflow.json"), workflow);

  const logLines = (payload.logs || [])
    .map((e) => `[${e.time}] [${e.level || "info"}] ${e.message}`)
    .join("\n");
  writeText(path.join(bundleDir, "logs", "compose.log"), logLines || "(no logs)");

  const copiedFiles: string[] = [
    "README.md",
    "project.json",
    "timeline.json",
    "workflow.json",
    "script/shots.json",
    "script/manim-jobs.json",
    "logs/compose.log",
  ];
  if (payload.theme) copiedFiles.push("theme.json");

  const remotionSrc = getRemotionOutputPath(taskId);
  if (copyIfExists(remotionSrc, path.join(bundleDir, "assets", "final.mp4"))) {
    copiedFiles.push("assets/final.mp4");
  }

  const manimJobs = payload.manimJobs || [];
  for (let i = 0; i < manimJobs.length; i++) {
    const job = manimJobs[i];
    const manimId = `${taskId}-m${i}`;
    const baseName = `${String(i).padStart(2, "0")}-${job.type}`;
    const mp4Src = getManimOutputPath(manimId);
    const jsonSrc = mp4Src.replace(/\.mp4$/, ".json");
    const mp4Dest = path.join(bundleDir, "assets", "manim", `${baseName}.mp4`);
    const jsonDest = path.join(bundleDir, "assets", "manim", `${baseName}.json`);
    if (copyIfExists(mp4Src, mp4Dest)) {
      copiedFiles.push(`assets/manim/${baseName}.mp4`);
    }
    if (copyIfExists(jsonSrc, jsonDest)) {
      copiedFiles.push(`assets/manim/${baseName}.json`);
    }
  }

  const manifest = {
    version: 1,
    taskId,
    title,
    createdAt: payload.startedAt,
    completedAt: payload.updatedAt,
    renderFinal: payload.renderFinal !== false,
    outputUrl,
    files: copiedFiles,
  };
  writeJson(path.join(bundleDir, "manifest.json"), manifest);

  await zipAsOutputFolder(bundleDir, bundleZipPath);

  const relDir = `files/output/${taskId}`;
  return {
    bundleDir,
    bundleZipPath,
    bundleDirUrl: toPublicUrl(relDir),
    bundleZipUrl: toPublicUrl(`files/output/${taskId}.zip`),
  };
}
