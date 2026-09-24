import { renderManim } from "../manim/render";
import { renderRemotion } from "../remotion/render";
import { planFromBrief, TimelineItem, ThemeConfig } from "./plan-timeline";
import {
  markComposeStep,
  patchComposeProgress,
} from "./compose-progress";
import type { ComposePayload } from "./compose-progress";
import { createComposeOutputBundle } from "./output-bundle";
import { resolveManimCjkFont } from "./manim-font";
import { injectThemeIntoManimParams } from "./manim-theme";
import { COMPOSE_FPS } from "./shot-plan-parser";
import { resolveMediaParamsForManim } from "../../lib/media-path";
import { resolveGlobalOverlay, resolveProjectAspect } from "./composite-shots";
import {
  manimQualityFlag,
  remotionScale,
  resolveRenderQuality,
} from "./render-quality";

function manimClipDurationFrames(
  slotFrames: number | undefined,
  params: Record<string, unknown>
): number {
  if (typeof params.durationInFrames === "number" && params.durationInFrames > 0) {
    return Math.round(params.durationInFrames);
  }
  if (typeof params.durationSeconds === "number" && params.durationSeconds > 0) {
    return Math.round(params.durationSeconds * COMPOSE_FPS);
  }
  return slotFrames || 150;
}

export type { ComposePayload };

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

export async function renderCompose(
  taskId: string,
  payload: ComposePayload
): Promise<{ outputUrl?: string; timeline: TimelineItem[]; bundleZipUrl?: string }> {
  const renderFinal = payload.renderFinal !== false;
  const templateId = payload.templateId || "simple-electric";
  const quality = resolveRenderQuality({
    projectQuality: payload.project?.renderQuality,
    previewFlag: payload.preview,
  });
  const preview = quality === "preview";

  markComposeStep(taskId, "queue", "done", "Worker 已接管任务");
  markComposeStep(taskId, "plan", "running");
  patchComposeProgress(taskId, {
    phase: "planning",
    progress: `正在分析视频要求并规划时间轴…（画质 ${quality}）`,
    log: `开始规划时间轴 · renderQuality=${quality}`,
  });

  let timeline = payload.timeline;
  let manimJobs = payload.manimJobs;
  let theme = payload.theme;

  if (!timeline || !manimJobs) {
    const plan = planFromBrief(payload.brief, payload.title, payload.project);
    timeline = plan.timeline;
    manimJobs = plan.manimJobs;
    const projectTheme = payload.project?.theme;
    theme = payload.theme
      ? { ...plan.theme, ...projectTheme, ...payload.theme }
      : { ...plan.theme, ...projectTheme };
    patchComposeProgress(taskId, {
      phase: "planned",
      progress: `规划完成：${manimJobs.length} 个 Manim 镜头`,
      timeline,
      manimJobs,
      theme,
      title: plan.title,
      manimTotal: manimJobs.length,
      manimCurrent: 0,
      log: `时间轴已生成，共 ${timeline.length} 个片段、${manimJobs.length} 个 Manim 任务`,
      logLevel: "success",
    });
  }

  markComposeStep(taskId, "plan", "done");
  markComposeStep(taskId, "manim", "running");
  patchComposeProgress(taskId, {
    phase: "manim",
    progress: `正在渲染 Manim（0/${manimJobs!.length}）…`,
    manimTotal: manimJobs!.length,
    manimCurrent: 0,
    log: `开始 Manim 批量渲染，共 ${manimJobs!.length} 个`,
  });

  const manimResults: ComposePayload["manimResults"] = [];
  const composeManimFont = resolveManimCjkFont(theme);

  for (let i = 0; i < manimJobs!.length; i++) {
    const job = manimJobs![i];
    const manimTaskId = `${taskId}-m${i}`;

    patchComposeProgress(taskId, {
      manimCurrent: i,
      progress: `Manim 渲染中 ${i + 1}/${manimJobs!.length}：${job.label}（${job.type}）`,
      log: `[${i + 1}/${manimJobs!.length}] 开始渲染 ${job.type} — ${job.label}`,
    });

    const manimParams = injectThemeIntoManimParams(
      resolveMediaParamsForManim(job.type, { ...(job.params || {}) }),
      theme
    );
    const shotFont = resolveManimCjkFont(theme, manimParams) ?? composeManimFont;
    if (job.type === "manim_custom") {
      const scene =
        manimParams.scene ?? manimParams.class_name ?? (job.params || {}).scene;
      if (!scene || !String(scene).trim()) {
        throw new Error(
          `Manim 镜头「${job.label}」缺少 params.scene（例如 LorenzScene、CardioidScene）`
        );
      }
      manimParams.scene = String(scene).trim();
    }
    if (shotFont && !manimParams.cjk_font) {
      manimParams.cjk_font = shotFont;
    }

    const result = await renderManim(manimTaskId, {
      type: job.type,
      params: manimParams,
      manimCjkFont: shotFont,
      quality: manimQualityFlag(quality),
    });

    const clipUrl = toRemotionMediaUrl(result.outputUrl);
    const slot = timeline![job.timelineIndex];
    const clipFrames = manimClipDurationFrames(slot.durationInFrames, manimParams);
    timeline![job.timelineIndex] = {
      type: "manim_clip",
      durationInFrames: clipFrames,
      title: slot.title || job.label,
      sourceUrl: clipUrl,
      manimType: job.type,
    };

    manimResults.push({
      timelineIndex: job.timelineIndex,
      type: job.type,
      outputUrl: result.outputUrl,
      mode: result.mode,
    });

    patchComposeProgress(taskId, {
      manimCurrent: i + 1,
      timeline,
      manimResults,
      progress: `Manim 完成 ${i + 1}/${manimJobs!.length}：${job.label}`,
      log: `[${i + 1}/${manimJobs!.length}] ✓ ${job.label}（${result.mode === "mock" ? "占位" : "真实"}）`,
      logLevel: result.mode === "mock" ? "warn" : "success",
    });
  }

  markComposeStep(taskId, "manim", "done");
  markComposeStep(taskId, "timeline", "running");
  patchComposeProgress(taskId, {
    phase: "timeline_ready",
    progress: "时间轴 JSON 已自动填入所有 Manim 地址",
    timeline,
    manimResults,
    log: "时间轴已更新，全部 Manim 片段已写入 sourceUrl",
    logLevel: "success",
  });
  markComposeStep(taskId, "timeline", "done");

  if (!renderFinal) {
    markComposeStep(taskId, "remotion", "skipped");
    const bundle = await exportOutputBundle(taskId, payload, timeline!, undefined);
    markComposeStep(taskId, "done", "done", "任务完成（未合成成片）");
    patchComposeProgress(taskId, {
      phase: "done",
      progress: `时间轴 + Manim 已生成；工程包已导出`,
      progressPercent: 100,
      bundleZipUrl: bundle.bundleZipUrl,
      bundleDirUrl: bundle.bundleDirUrl,
    });
    return { timeline: timeline!, bundleZipUrl: bundle.bundleZipUrl };
  }

  markComposeStep(taskId, "remotion", "running");
  patchComposeProgress(taskId, {
    phase: "remotion",
    progress: "Remotion 正在合成最终 MP4（约 1～5 分钟）…",
    log: "开始 Remotion 渲染成片",
  });

  const aspect = resolveProjectAspect(payload.project, timeline);
  const globalOverlay = resolveGlobalOverlay(payload.project, toRemotionMediaUrl);
  const remotionResult = await renderRemotion(taskId, {
    templateId,
    timeline: timeline!,
    theme,
    preview,
    aspect,
    globalOverlay,
    scale: remotionScale(quality),
  });

  markComposeStep(taskId, "remotion", "done");

  const bundle = await exportOutputBundle(
    taskId,
    payload,
    timeline!,
    remotionResult.outputUrl
  );

  markComposeStep(taskId, "done", "done", "成片与工程包已生成");
  patchComposeProgress(taskId, {
    phase: "done",
    progress: "全部完成！可下载成片或 output 工程包",
    progressPercent: 100,
    timeline,
    bundleZipUrl: bundle.bundleZipUrl,
    bundleDirUrl: bundle.bundleDirUrl,
    log: `成片：${remotionResult.outputUrl} · 工程包：${bundle.bundleZipUrl}`,
    logLevel: "success",
  });

  return {
    outputUrl: remotionResult.outputUrl,
    timeline: timeline!,
    bundleZipUrl: bundle.bundleZipUrl,
  };
}

async function exportOutputBundle(
  taskId: string,
  _payload: ComposePayload,
  timeline: TimelineItem[],
  outputUrl?: string
) {
  markComposeStep(taskId, "bundle", "running");
  patchComposeProgress(taskId, {
    phase: "bundle",
    progress: "正在打包 output 工程（素材、脚本、流程说明）…",
    log: "开始导出 output 文件夹与 ZIP",
  });

  const { db } = await import("../../lib/db");
  const row = db.task.findFirst({ id: taskId });
  const latest = row ? (JSON.parse(row.payload) as ComposePayload) : _payload;

  const bundle = await createComposeOutputBundle(taskId, latest, timeline, outputUrl);

  markComposeStep(taskId, "bundle", "done");
  patchComposeProgress(taskId, {
    log: `工程包已生成：${bundle.bundleZipUrl}`,
    logLevel: "success",
  });

  return bundle;
}
