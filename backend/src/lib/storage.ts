import fs from "fs";
import path from "path";

const STORAGE_ROOT = path.resolve(
  process.env.STORAGE_PATH || path.join(__dirname, "../../storage")
);

export function ensureStorageDirs() {
  const dirs = [
    STORAGE_ROOT,
    path.join(STORAGE_ROOT, "files", "manim"),
    path.join(STORAGE_ROOT, "files", "remotion"),
    path.join(STORAGE_ROOT, "files", "output"),
    path.join(STORAGE_ROOT, "frames"),
    path.join(STORAGE_ROOT, "video"),
    path.join(STORAGE_ROOT, "uploads"),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getStorageRoot() {
  return STORAGE_ROOT;
}

export function getManimOutputPath(taskId: string) {
  return path.join(STORAGE_ROOT, "files", "manim", `${taskId}.mp4`);
}

export function getRemotionOutputPath(taskId: string) {
  return path.join(STORAGE_ROOT, "files", "remotion", `${taskId}.mp4`);
}

export function getOutputBundleDir(taskId: string) {
  return path.join(STORAGE_ROOT, "files", "output", taskId);
}

export function getOutputBundleZipPath(taskId: string) {
  return path.join(STORAGE_ROOT, "files", "output", `${taskId}.zip`);
}

export function getFramesDir(taskId: string) {
  return path.join(STORAGE_ROOT, "frames", taskId);
}

export function getHyperFramesVideoPath(taskId: string) {
  return path.join(STORAGE_ROOT, "video", `${taskId}.mp4`);
}

export function toPublicUrl(relativePath: string): string {
  const base = (process.env.PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const normalized = relativePath.replace(/\\/g, "/");
  const pathPart = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${base}${pathPart}`;
}
