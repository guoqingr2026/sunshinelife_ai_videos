/** Manim 媒体类 type 与 params 字段映射 */

export const MEDIA_PARAM_KEY: Record<string, "imagePath" | "svgPath" | "videoPath"> = {
  image_focus: "imagePath",
  svg_icon: "svgPath",
  video_embed: "videoPath",
};

export const MEDIA_TYPES = new Set(Object.keys(MEDIA_PARAM_KEY));

export function isMediaManimType(type: string): boolean {
  return MEDIA_TYPES.has(type);
}

export function mediaParamKeyForType(type: string): "imagePath" | "svgPath" | "videoPath" | null {
  return MEDIA_PARAM_KEY[type] ?? null;
}

export function applyMediaUrlToParams(
  type: string,
  params: Record<string, unknown>,
  url: string
): Record<string, unknown> {
  const key = mediaParamKeyForType(type);
  if (!key) return params;
  return { ...params, [key]: url };
}

export function suggestManimTypeForKind(kind: "image" | "video" | "svg"): string {
  if (kind === "video") return "video_embed";
  if (kind === "svg") return "svg_icon";
  return "image_focus";
}
