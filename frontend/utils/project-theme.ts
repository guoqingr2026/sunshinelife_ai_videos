import { COLOR_SCHEMES, ThemeConfig } from "./remotion-presets";
import { applyFontPresetToTheme, DEFAULT_FONT_PRESET } from "./typography-presets";

export const DEFAULT_COLOR_SCHEME_NAME = "B站粉";

export const DEFAULT_PROJECT_THEME: ThemeConfig = {
  name: "B站粉",
  primaryColor: "#fb7299",
  secondaryColor: "#23ade5",
  backgroundColor: "#141420",
  accentColor: "#ffe066",
  fontPresetId: "noto-sans-sc",
};

export function getDefaultColorSchemeIndex(): number {
  const idx = COLOR_SCHEMES.findIndex((s) => s.name === DEFAULT_COLOR_SCHEME_NAME);
  return idx >= 0 ? idx : 0;
}

export function findColorSchemeIndexByName(name?: string): number {
  if (!name) return getDefaultColorSchemeIndex();
  const idx = COLOR_SCHEMES.findIndex((s) => s.name === name);
  return idx >= 0 ? idx : getDefaultColorSchemeIndex();
}

export interface ProjectThemeInput {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  fontPresetId?: string;
  fontFamily?: string;
  manimCjkFont?: string;
}

export function syncUiFromProjectTheme(theme?: ProjectThemeInput): {
  colorSchemeIndex: number;
  fontPresetId: string;
} {
  let colorSchemeIndex = getDefaultColorSchemeIndex();
  if (theme?.name) {
    colorSchemeIndex = findColorSchemeIndexByName(theme.name);
  } else if (theme?.primaryColor) {
    const byColor = COLOR_SCHEMES.findIndex((s) => s.primaryColor === theme.primaryColor);
    if (byColor >= 0) colorSchemeIndex = byColor;
  }
  return {
    colorSchemeIndex,
    fontPresetId: theme?.fontPresetId || DEFAULT_FONT_PRESET.id,
  };
}

/** 成片 theme：以页面配色 + 字体选择器为准（JSON theme 仅用于初始化 UI 与存档） */
export function buildComposeTheme(
  colorSchemeIndex: number,
  fontPresetId: string
): ThemeConfig {
  const scheme = COLOR_SCHEMES[colorSchemeIndex] ?? COLOR_SCHEMES[getDefaultColorSchemeIndex()];
  return applyFontPresetToTheme(scheme, fontPresetId);
}

export function themeBlockForJson(
  colorSchemeIndex: number,
  fontPresetId: string
): ThemeConfig {
  return buildComposeTheme(colorSchemeIndex, fontPresetId);
}

export const THEME_JSON_EXAMPLE = `  "theme": {
    "name": "B站粉",
    "primaryColor": "#fb7299",
    "secondaryColor": "#23ade5",
    "backgroundColor": "#141420",
    "accentColor": "#ffe066",
    "fontPresetId": "noto-sans-sc"
  }`;
