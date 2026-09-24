export type RenderQuality = "high" | "medium" | "preview";

/** Manim CLI quality flag: -qh / -qm / -ql */
export function manimQualityFlag(quality: RenderQuality): "-qh" | "-qm" | "-ql" {
  if (quality === "high") return "-qh";
  if (quality === "medium") return "-qm";
  return "-ql";
}

/** Remotion --scale: 1 = full HD, 0.5 = preview */
export function remotionScale(quality: RenderQuality): string {
  return quality === "preview" ? "0.5" : "1";
}

/**
 * Resolve quality for compose.
 * Priority: project.renderQuality → payload.preview (true=preview, false=high) → high
 */
export function resolveRenderQuality(opts: {
  projectQuality?: string;
  previewFlag?: boolean;
}): RenderQuality {
  const raw = String(opts.projectQuality || "")
    .trim()
    .toLowerCase();
  if (raw === "high" || raw === "hq" || raw === "1080p") return "high";
  if (raw === "medium" || raw === "mq" || raw === "mid") return "medium";
  if (raw === "preview" || raw === "low" || raw === "lq") return "preview";
  if (opts.previewFlag === true) return "preview";
  if (opts.previewFlag === false) return "high";
  return "high";
}
