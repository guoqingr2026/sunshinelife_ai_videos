import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getStorageRoot } from "./storage";

const MEDIA_PATH_KEYS = ["imagePath", "videoPath", "svgPath", "path", "url"] as const;
const MANIM_MEDIA_TYPES = new Set(["image_focus", "svg_icon", "video_embed"]);

/** Strip URL/subpath prefix down to a path relative to storage/files/ */
export function normalizeFilesRel(raw: string): string {
  let rel = raw.trim();
  const filesIdx = rel.indexOf("/files/");
  if (filesIdx >= 0) {
    rel = rel.slice(filesIdx + "/files/".length);
  } else {
    rel = rel.replace(/^\/+/, "");
  }
  if (rel.startsWith("files/")) rel = rel.slice("files/".length);
  return rel;
}

/** Resolve /files/... or public URL to an absolute filesystem path for Manim. */
export function resolveMediaPathForManim(pathOrUrl: string): string {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return raw;
  if (path.isAbsolute(raw) && fs.existsSync(raw)) return raw;

  const storage = getStorageRoot();
  const rel = normalizeFilesRel(raw);
  if (!rel) return raw;

  const candidates = [
    path.join(storage, "files", rel),
    path.join(storage, rel),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return raw;
}

/** Resolve upload path to file:// URL for Remotion headless render (avoids CORS / localhost fetch). */
export function toRemotionLocalImageSrc(pathOrUrl: string): string | null {
  const abs = resolveMediaPathForManim(pathOrUrl);
  if (!path.isAbsolute(abs) || !fs.existsSync(abs)) return null;
  return pathToFileURL(abs).href;
}

export interface TimelineImageItem {
  type: string;
  sourceUrl?: string;
  params?: Record<string, unknown>;
}

export function resolveImageClipsInTimeline<T extends TimelineImageItem>(
  timeline: T[],
  httpFallback: (publicPath: string) => string
): T[] {
  return timeline.map((item) => {
    if (item.type !== "image_clip") return item;
    const imagePath =
      item.sourceUrl ||
      (item.params?.imagePath as string) ||
      (item.params?.url as string) ||
      "";
    if (!imagePath) return item;
    const local = toRemotionLocalImageSrc(imagePath);
    return {
      ...item,
      sourceUrl: local || httpFallback(imagePath),
    };
  });
}

export function resolveMediaParamsForManim(
  type: string,
  params: Record<string, unknown>
): Record<string, unknown> {
  if (!MANIM_MEDIA_TYPES.has(type)) return params;

  const out = { ...params };
  for (const key of MEDIA_PATH_KEYS) {
    const val = out[key];
    if (typeof val === "string" && val.trim()) {
      out[key] = resolveMediaPathForManim(val);
    }
  }
  return out;
}
