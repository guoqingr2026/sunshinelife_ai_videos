import type { ThemeConfig } from "./plan-timeline";
import { resolveManimCjkFont } from "./manim-font";

/** 将 Remotion 主题色与 Manim 字体注入 params，供 templates/_theme.py / _text.py 读取 */
export function injectThemeIntoManimParams(
  params: Record<string, unknown> = {},
  theme?: ThemeConfig
): Record<string, unknown> {
  if (!theme) {
    const font = resolveManimCjkFont(undefined, params);
    return font && !params.cjk_font ? { ...params, cjk_font: font } : { ...params };
  }
  const out = { ...params };
  if (theme.backgroundColor) out.backgroundColor = theme.backgroundColor;
  if (theme.primaryColor) out.primaryColor = theme.primaryColor;
  if (theme.secondaryColor) out.secondaryColor = theme.secondaryColor;
  if (theme.accentColor) out.accentColor = theme.accentColor;
  const font = resolveManimCjkFont(theme, out);
  if (font && !out.cjk_font) out.cjk_font = font;
  return out;
}
