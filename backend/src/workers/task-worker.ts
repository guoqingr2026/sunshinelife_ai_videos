import { db } from "../lib/db";
import { renderManim } from "../services/manim/render";
import { renderRemotion } from "../services/remotion/render";
import { renderHyperFrames } from "../services/hyperframes/render";
import { renderCompose } from "../services/video/compose";

let isProcessing = false;

export function startTaskWorker(intervalMs = 3000) {
  setInterval(processNextTask, intervalMs);
  console.log(`Task worker started (polling every ${intervalMs}ms)`);
}

async function processNextTask() {
  if (isProcessing) return;

  const task = db.task.findFirst({ status: "pending" });
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
        status: "success",
        outputUrl: result.outputUrl || undefined,
        framesUrl: result.framesUrl,
      });
    } else if (task.kind === "compose") {
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
    db.task.update({ id: task.id }, {
      status: "failed",
      error: String(err),
    });
  } finally {
    isProcessing = false;
  }
}
