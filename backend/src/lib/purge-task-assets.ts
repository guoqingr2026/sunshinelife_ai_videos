import fs from "fs";
import path from "path";
import type { Task } from "./db";
import {
  getFramesDir,
  getHyperFramesVideoPath,
  getManimOutputPath,
  getOutputBundleDir,
  getOutputBundleZipPath,
  getRemotionOutputPath,
  getStorageRoot,
} from "./storage";

function rmIfExists(target: string, removed: string[]) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    fs.rmSync(target, { recursive: true, force: true });
  } else {
    fs.unlinkSync(target);
  }
  removed.push(target);
}

function resolveUrlToPath(url: string, storageRoot: string): string | null {
  if (!url) return null;
  const normalized = url.replace(/\\/g, "/");
  const filesIdx = normalized.indexOf("/files/");
  const framesIdx = normalized.indexOf("/frames/");
  const videoIdx = normalized.indexOf("/video/");
  if (filesIdx >= 0) {
    return path.join(storageRoot, normalized.slice(filesIdx + 1));
  }
  if (framesIdx >= 0) {
    return path.join(storageRoot, normalized.slice(framesIdx + 1));
  }
  if (videoIdx >= 0) {
    return path.join(storageRoot, normalized.slice(videoIdx + 1));
  }
  const rel = normalized.replace(/^\//, "");
  const direct = path.join(storageRoot, rel);
  return fs.existsSync(direct) ? direct : null;
}

/** Remove all on-disk artifacts for a task (does not touch DB). */
export function purgeTaskAssets(task: Task): string[] {
  const removed: string[] = [];
  const storageRoot = getStorageRoot();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(task.payload || "{}") as Record<string, unknown>;
  } catch {
    payload = {};
  }

  if (task.kind === "compose") {
    rmIfExists(getOutputBundleDir(task.id), removed);
    rmIfExists(getOutputBundleZipPath(task.id), removed);
    rmIfExists(getRemotionOutputPath(task.id), removed);

    const manimJobs = Array.isArray(payload.manimJobs) ? payload.manimJobs : [];
    for (let i = 0; i < manimJobs.length; i++) {
      const manimId = `${task.id}-m${i}`;
      rmIfExists(getManimOutputPath(manimId), removed);
      rmIfExists(getManimOutputPath(manimId).replace(/\.mp4$/, ".json"), removed);
    }
  }

  if (task.kind === "manim") {
    rmIfExists(getManimOutputPath(task.id), removed);
    rmIfExists(getManimOutputPath(task.id).replace(/\.mp4$/, ".json"), removed);
  }

  if (task.kind === "remotion") {
    rmIfExists(getRemotionOutputPath(task.id), removed);
  }

  if (task.kind === "hyperframes") {
    rmIfExists(getHyperFramesVideoPath(task.id), removed);
    rmIfExists(getFramesDir(task.id), removed);
  }

  if (task.outputUrl) {
    const p = resolveUrlToPath(task.outputUrl, storageRoot);
    if (p) rmIfExists(p, removed);
  }

  const manimResults = Array.isArray(payload.manimResults) ? payload.manimResults : [];
  for (const item of manimResults) {
    if (item && typeof item === "object" && "outputUrl" in item) {
      const p = resolveUrlToPath(String((item as { outputUrl: string }).outputUrl), storageRoot);
      if (p) rmIfExists(p, removed);
    }
  }

  if (task.framesUrl) {
    const framesDir = path.join(
      storageRoot,
      "frames",
      task.framesUrl.replace(/^\/frames\//, "").replace(/\/$/, "")
    );
    rmIfExists(framesDir, removed);
  }

  return removed;
}
