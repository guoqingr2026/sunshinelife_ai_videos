import React, { createContext, useContext } from "react";

export const DEFAULT_FONT_FAMILY =
  '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif';
export const DEFAULT_FONT_MONO = '"JetBrains Mono", Consolas, "Courier New", monospace';
export const DEFAULT_FONT_SERIF = 'Georgia, "Times New Roman", "Songti SC", serif';

export interface ThemeFontValues {
  fontFamily: string;
  fontMono: string;
  fontSerif: string;
}

const ThemeFontContext = createContext<ThemeFontValues>({
  fontFamily: DEFAULT_FONT_FAMILY,
  fontMono: DEFAULT_FONT_MONO,
  fontSerif: DEFAULT_FONT_SERIF,
});

export function ThemeFontProvider({
  fontFamily,
  children,
}: {
  fontFamily?: string;
  children: React.ReactNode;
}) {
  const value: ThemeFontValues = {
    fontFamily: fontFamily || DEFAULT_FONT_FAMILY,
    fontMono: DEFAULT_FONT_MONO,
    fontSerif: DEFAULT_FONT_SERIF,
  };
  return <ThemeFontContext.Provider value={value}>{children}</ThemeFontContext.Provider>;
}

export function useThemeFont(): ThemeFontValues {
  return useContext(ThemeFontContext);
}

export function resolveRemotionFontFamily(theme?: {
  fontFamily?: string;
  font?: string;
  fontPresetId?: string;
}): string {
  if (theme?.fontFamily?.trim()) return theme.fontFamily.trim();
  if (theme?.font?.trim()) return theme.font.trim();
  return DEFAULT_FONT_FAMILY;
}
