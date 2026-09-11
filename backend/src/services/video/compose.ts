import { renderManim } from "../manim/render";
import { renderRemotion } from "../remotion/render";
import { planFromBrief, TimelineItem, ThemeConfig } from "./plan-timeline";
import {
  markComposeStep,
  patchComposeProgress,
} from "./compose-progress";
import type { ComposePayload } from "./compose-progress";

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
): Promise<{ outputUrl?: string; timeline: TimelineItem[] }> {
  const renderFinal = payload.renderFinal !== false;
  const templateId = payload.templateId || "simple-electric";
  const preview = payload.preview ?? true;

  markComposeStep(taskId, "queue", "done", "Worker 已接管任务");
  markComposeStep(taskId, "plan", "running");
  patchComposeProgress(taskId, {
    phase: "planning",
    progress: "正在分析视频要求并规划时间轴…",
    log: "开始规划时间轴",
  });

  let timeline = payload.timeline;
  let manimJobs = payload.manimJobs;
  let theme = payload.theme;

  if (!timeline || !manimJobs) {
    const plan = planFromBrief(payload.brief, payload.title);
    timeline = plan.timeline;
    manimJobs = plan.manimJobs;
    theme = plan.theme;
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

  for (let i = 0; i < manimJobs!.length; i++) {
    const job = manimJobs![i];
    const manimTaskId = `${taskId}-m${i}`;

    patchComposeProgress(taskId, {
      manimCurrent: i,
      progress: `Manim 渲染中 ${i + 1}/${manimJobs!.length}：${job.label}（${job.type}）`,
      log: `[${i + 1}/${manimJobs!.length}] 开始渲染 ${job.type} — ${job.label}`,
    });

    const result = await renderManim(manimTaskId, {
      type: job.type,
      params: job.params,
    });

    const clipUrl = toRemotionMediaUrl(result.outputUrl);
    const slot = timeline![job.timelineIndex];
    timeline![job.timelineIndex] = {
      type: "manim_clip",
      durationInFrames: slot.durationInFrames || 150,
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
    markComposeStep(taskId, "done", "done", "任务完成（未合成成片）");
    patchComposeProgress(taskId, {
      phase: "done",
      progress: "时间轴 + Manim 已生成（跳过成片合成）",
      progressPercent: 100,
    });
    return { timeline: timeline! };
  }

  markComposeStep(taskId, "remotion", "running");
  patchComposeProgress(taskId, {
    phase: "remotion",
    progress: "Remotion 正在合成最终 MP4（约 1～5 分钟）…",
    log: "开始 Remotion 渲染成片",
  });

  const remotionResult = await renderRemotion(taskId, {
    templateId,
    timeline: timeline!,
    theme,
    preview,
  });

  markComposeStep(taskId, "remotion", "done");
  markComposeStep(taskId, "done", "done", "成片已生成");
  patchComposeProgress(taskId, {
    phase: "done",
    progress: "全部完成！可预览或下载成片",
    progressPercent: 100,
    timeline,
    log: `成片地址：${remotionResult.outputUrl}`,
    logLevel: "success",
  });

  return {
    outputUrl: remotionResult.outputUrl,
    timeline: timeline!,
  };
}
