import type { ThemeConfig } from "./plan-timeline";

/** 与 frontend/utils/typography-presets.ts 保持一致 */
const FONT_PRESET_TO_MANIM: Record<string, string> = {
  "noto-sans-sc": "Noto Sans SC",
  "microsoft-yahei": "Microsoft YaHei",
  pingfang: "PingFang SC",
  kaiti: "KaiTi",
  arial: "Arial",
  georgia: "Georgia",
};

export function resolveManimCjkFont(
  theme?: ThemeConfig,
  params?: Record<string, unknown>
): string | undefined {
  const pick = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : undefined;

  const fromParams =
    pick(params?.cjk_font) ||
    pick(params?.manimCjkFont) ||
    pick(params?.font) ||
    pick(params?.fontFamily);
  if (fromParams) return fromParams;

  if (theme?.manimCjkFont) return theme.manimCjkFont;
  if (theme?.fontPresetId && FONT_PRESET_TO_MANIM[theme.fontPresetId]) {
    return FONT_PRESET_TO_MANIM[theme.fontPresetId];
  }
  if (theme?.fontFamily) {
    const quoted = theme.fontFamily.match(/"([^"]+)"/);
    if (quoted?.[1]) return quoted[1];
  }
  return undefined;
}
