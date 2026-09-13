import React, { createContext, useContext } from "react";

export const DEFAULT_FONT_FAMILY =
  '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif';
export const DEFAULT_FONT_MONO = '"JetBrains Mono", Consolas, "Courier New", monospace';
export const DEFAULT_FONT_SERIF = 'Georgia, "Times New Roman", "Songti SC", serif';

export const DEFAULT_FONT_WEIGHT = 700;

export interface ThemeFontValues {
  fontFamily: string;
  fontMono: string;
  fontSerif: string;
  fontWeight: number;
}

const ThemeFontContext = createContext<ThemeFontValues>({
  fontFamily: DEFAULT_FONT_FAMILY,
  fontMono: DEFAULT_FONT_MONO,
  fontSerif: DEFAULT_FONT_SERIF,
  fontWeight: DEFAULT_FONT_WEIGHT,
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
    fontWeight: DEFAULT_FONT_WEIGHT,
  };
  return (
    <ThemeFontContext.Provider value={value}>
      <div
        style={{
          fontFamily: value.fontFamily,
          fontWeight: value.fontWeight,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </ThemeFontContext.Provider>
  );
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
