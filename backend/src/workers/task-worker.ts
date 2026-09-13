import { db } from "../lib/db";
import { renderManim } from "../services/manim/render";
import { renderRemotion } from "../services/remotion/render";
import { renderHyperFrames } from "../services/hyperframes/render";
import { renderCompose } from "../services/video/compose";
import { patchComposeProgress } from "../services/video/compose-progress";

let isProcessing = false;

function findOldestPendingTask() {
  const pending = db.task
    .findMany()
    .filter((t) => t.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  return pending[0] || null;
}

export function startTaskWorker(intervalMs = 2000) {
  setInterval(processNextTask, intervalMs);
  console.log(`Task worker started (polling every ${intervalMs}ms)`);
}

async function processNextTask() {
  if (isProcessing) return;

  const task = findOldestPendingTask();
  if (!task) return;

  isProcessing = true;

  try {
    db.task.update({ id: task.id }, { status: "running" });

    const payload = JSON.parse(task.payload);

    if (task.kind === "manim") {
      const result = await renderManim(task.id, payload);
      db.task.update({ id: task.id }, {
        status: "success",
        outputUrl: result.outputUrl,
        error: result.warning,
      });
    } else if (task.kind === "remotion") {
      const result = await renderRemotion(task.id, payload);
      db.task.update({ id: task.id }, {
        status: "success",
        outputUrl: result.outputUrl,
      });
    } else if (task.kind === "hyperframes") {
      const result = await renderHyperFrames(task.id, payload);
      db.task.update({ id: task.id }, {
        status: result.warning && !result.outputUrl ? "failed" : "success",
        outputUrl: result.outputUrl || undefined,
        framesUrl: result.framesUrl,
        error: result.warning,
      });
    } else if (task.kind === "compose") {
      patchComposeProgress(task.id, {
        phase: "starting",
        progress: "任务已开始执行…",
        log: "Worker 开始处理一键成片任务",
      });
      const result = await renderCompose(task.id, payload);
      db.task.update({ id: task.id }, {
        status: "success",
        outputUrl: result.outputUrl,
      });
    } else {
      throw new Error(`Unknown task kind: ${task.kind}`);
    }

    console.log(`Task ${task.id} (${task.kind}) completed`);
  } catch (err) {
    console.error(`Task ${task.id} failed:`, err);
    if (task.kind === "compose") {
      patchComposeProgress(task.id, {
        phase: "failed",
        progress: `失败：${String(err)}`,
        log: `任务失败：${String(err)}`,
        logLevel: "error",
      });
    }
    db.task.update({ id: task.id }, {
      status: "failed",
      error: String(err),
    });
  } finally {
    isProcessing = false;
  }
}
