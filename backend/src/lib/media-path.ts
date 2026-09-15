import fs from "fs";
import path from "path";
import { getStorageRoot } from "./storage";

const MAX_INLINE_IMAGE_BYTES = 12 * 1024 * 1024;

function mimeForImageExt(ext: string): string | null {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return null;
  }
}

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

/**
 * Inline upload as data: URL for Remotion <Img>.
 * file:// and localhost HTTP are unreliable in headless Chrome; base64 always works.
 */
export function toRemotionInlineImageSrc(pathOrUrl: string): string | null {
  const abs = resolveMediaPathForManim(pathOrUrl);
  if (!path.isAbsolute(abs) || !fs.existsSync(abs)) return null;

  const mime = mimeForImageExt(path.extname(abs));
  if (!mime) return null;

  const stat = fs.statSync(abs);
  if (stat.size > MAX_INLINE_IMAGE_BYTES) return null;

  const data = fs.readFileSync(abs);
  return `data:${mime};base64,${data.toString("base64")}`;
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
    const inline = toRemotionInlineImageSrc(imagePath);
    return {
      ...item,
      sourceUrl: inline || httpFallback(imagePath),
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
