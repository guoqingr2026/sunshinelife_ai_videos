import type { ThemeConfig } from "./plan-timeline";

/** 将 Remotion 主题色注入 Manim params，供 templates/_theme.py 读取 */
export function injectThemeIntoManimParams(
  params: Record<string, unknown> = {},
  theme?: ThemeConfig
): Record<string, unknown> {
  if (!theme) return { ...params };
  const out = { ...params };
  if (theme.backgroundColor) out.backgroundColor = theme.backgroundColor;
  if (theme.primaryColor) out.primaryColor = theme.primaryColor;
  if (theme.secondaryColor) out.secondaryColor = theme.secondaryColor;
  if (theme.accentColor) out.accentColor = theme.accentColor;
  return out;
}
