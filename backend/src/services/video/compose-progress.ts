import { db } from "../../lib/db";
import { ThemeConfig, TimelineItem } from "./plan-timeline";

export interface ComposeLogEntry {
  time: string;
  message: string;
  level?: "info" | "success" | "warn" | "error";
}

export interface ComposeStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "skipped" | "error";
}

export interface ComposePayload {
  brief: string;
  project?: { title?: string; shots?: Array<{ type: string; label: string; params?: Record<string, unknown> }> };
  title?: string;
  preview?: boolean;
  renderFinal?: boolean;
  templateId?: string;
  theme?: ThemeConfig;
  phase?: string;
  progress?: string;
  progressPercent?: number;
  startedAt?: string;
  updatedAt?: string;
  manimTotal?: number;
  manimCurrent?: number;
  logs?: ComposeLogEntry[];
  steps?: ComposeStep[];
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
  bundleZipUrl?: string;
  bundleDirUrl?: string;
}

const DEFAULT_STEPS: ComposeStep[] = [
  { id: "queue", label: "排队等待", status: "pending" },
  { id: "plan", label: "规划时间轴", status: "pending" },
  { id: "manim", label: "渲染 Manim 动画", status: "pending" },
  { id: "timeline", label: "写入时间轴 JSON", status: "pending" },
  { id: "remotion", label: "Remotion 合成成片", status: "pending" },
  { id: "bundle", label: "导出工程包 (output)", status: "pending" },
  { id: "done", label: "完成", status: "pending" },
];

function nowIso() {
  return new Date().toISOString();
}

function calcPercent(payload: ComposePayload): number {
  const steps = payload.steps || DEFAULT_STEPS;
  const done = steps.filter((s) => s.status === "done").length;
  const running = steps.some((s) => s.status === "running") ? 0.5 : 0;
  const base = ((done + running) / steps.length) * 100;

  if (payload.phase === "manim" && payload.manimTotal && payload.manimTotal > 0) {
    const cur = payload.manimCurrent || 0;
    const manimSlice = 40 / payload.manimTotal;
    const manimDone = steps.find((s) => s.id === "plan")?.status === "done" ? 15 : 5;
    return Math.min(85, Math.round(manimDone + cur * manimSlice));
  }

  if (payload.phase === "remotion") return 88;
  if (payload.phase === "bundle") return 95;
  if (payload.phase === "done") return 100;
  if (payload.phase === "failed") return payload.progressPercent || 0;

  return Math.round(base);
}

function setStepStatus(
  steps: ComposeStep[],
  stepId: string,
  status: ComposeStep["status"]
): ComposeStep[] {
  return steps.map((s) => (s.id === stepId ? { ...s, status } : s));
}

export function initComposeProgress(taskId: string, renderFinal: boolean): void {
  const steps = DEFAULT_STEPS.map((s) =>
    s.id === "remotion" && !renderFinal ? { ...s, status: "skipped" as const } : s
  );
  patchComposeProgress(taskId, {
    phase: "pending",
    progress: "已提交，等待 Worker 执行…",
    progressPercent: 2,
    steps: steps.map((s) => (s.id === "queue" ? { ...s, status: "running" } : s)),
    logs: [{ time: nowIso(), message: "任务已创建，加入队列", level: "info" }],
    startedAt: nowIso(),
    manimTotal: 0,
    manimCurrent: 0,
  });
}

export function patchComposeProgress(
  taskId: string,
  patch: Partial<ComposePayload> & { log?: string; logLevel?: ComposeLogEntry["level"] }
): void {
  const task = db.task.findFirst({ id: taskId });
  if (!task) return;

  const current = JSON.parse(task.payload) as ComposePayload;
  const logs = [...(current.logs || [])];

  if (patch.log) {
    logs.push({
      time: nowIso(),
      message: patch.log,
      level: patch.logLevel || "info",
    });
    if (logs.length > 120) logs.splice(0, logs.length - 120);
  }

  const { log: _l, logLevel: _ll, ...rest } = patch;
  const merged: ComposePayload = {
    ...current,
    ...rest,
    logs,
    updatedAt: nowIso(),
  };
  merged.progressPercent = calcPercent(merged);

  db.task.update({ id: taskId }, { payload: JSON.stringify(merged) });
}

export function markComposeStep(
  taskId: string,
  stepId: string,
  status: ComposeStep["status"],
  message?: string
): void {
  const task = db.task.findFirst({ id: taskId });
  if (!task) return;
  const current = JSON.parse(task.payload) as ComposePayload;
  let steps = current.steps || [...DEFAULT_STEPS];
  steps = setStepStatus(steps, stepId, status);

  if (status === "running") {
    steps = steps.map((s) =>
      s.id !== stepId && s.status === "running" ? { ...s, status: "done" as const } : s
    );
  }

  patchComposeProgress(taskId, {
    steps,
    log: message || `${stepLabel(stepId)}: ${statusLabel(status)}`,
    logLevel: status === "error" ? "error" : status === "done" ? "success" : "info",
  });
}

function stepLabel(id: string): string {
  return DEFAULT_STEPS.find((s) => s.id === id)?.label || id;
}

function statusLabel(status: ComposeStep["status"]): string {
  const map: Record<ComposeStep["status"], string> = {
    pending: "等待",
    running: "进行中",
    done: "完成",
    skipped: "跳过",
    error: "失败",
  };
  return map[status];
}
