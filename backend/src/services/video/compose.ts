import { db } from "../../lib/db";
import { renderManim } from "../manim/render";
import { renderRemotion } from "../remotion/render";
import { planFromBrief, TimelineItem, ThemeConfig } from "./plan-timeline";

export interface ComposePayload {
  brief: string;
  title?: string;
  preview?: boolean;
  renderFinal?: boolean;
  templateId?: string;
  theme?: ThemeConfig;
  phase?: string;
  progress?: string;
  timeline?: TimelineItem[];
  manimJobs?: Array<{
    timelineIndex: number;
    type: string;
    label: string;
    params?: Record<string, unknown>;
  }>;
  manimResults?: Array<{
    timelineIndex: number;
    type: string;
    outputUrl: string;
    mode: string;
  }>;
}

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

function patchPayload(taskId: string, patch: Partial<ComposePayload>) {
  const task = db.task.findFirst({ id: taskId });
  if (!task) return;
  const current = JSON.parse(task.payload) as ComposePayload;
  db.task.update(
    { id: taskId },
    { payload: JSON.stringify({ ...current, ...patch }) }
  );
}

export async function renderCompose(
  taskId: string,
  payload: ComposePayload
): Promise<{ outputUrl?: string; timeline: TimelineItem[] }> {
  const renderFinal = payload.renderFinal !== false;
  const templateId = payload.templateId || "simple-electric";
  const preview = payload.preview ?? true;

  let timeline = payload.timeline;
  let manimJobs = payload.manimJobs;
  let theme = payload.theme;

  if (!timeline || !manimJobs) {
    const plan = planFromBrief(payload.brief, payload.title);
    timeline = plan.timeline;
    manimJobs = plan.manimJobs;
    theme = plan.theme;
    patchPayload(taskId, {
      phase: "planned",
      progress: "已根据要求生成时间轴",
      timeline,
      manimJobs,
      theme,
      title: plan.title,
    });
  }

  const manimResults: ComposePayload["manimResults"] = [];

  patchPayload(taskId, { phase: "manim", progress: "正在渲染 Manim 动画…" });

  for (let i = 0; i < manimJobs.length; i++) {
    const job = manimJobs[i];
    const manimTaskId = `${taskId}-m${i}`;

    patchPayload(taskId, {
      progress: `Manim ${i + 1}/${manimJobs.length}: ${job.label}`,
    });

    const result = await renderManim(manimTaskId, {
      type: job.type,
      params: job.params,
    });

    const clipUrl = toRemotionMediaUrl(result.outputUrl);
    const slot = timeline[job.timelineIndex];
    timeline[job.timelineIndex] = {
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

    patchPayload(taskId, {
      timeline,
      manimResults,
      progress: `已完成 Manim: ${job.label}`,
    });
  }

  patchPayload(taskId, {
    phase: "timeline_ready",
    progress: "时间轴已自动填入 Manim 片段",
    timeline,
    manimResults,
  });

  if (!renderFinal) {
    patchPayload(taskId, { phase: "done", progress: "时间轴已生成（未渲染成片）" });
    return { timeline };
  }

  patchPayload(taskId, { phase: "remotion", progress: "正在合成最终视频…" });

  const remotionResult = await renderRemotion(taskId, {
    templateId,
    timeline,
    theme,
    preview,
  });

  patchPayload(taskId, {
    phase: "done",
    progress: "成片已生成",
    timeline,
  });

  return {
    outputUrl: remotionResult.outputUrl,
    timeline,
  };
}
