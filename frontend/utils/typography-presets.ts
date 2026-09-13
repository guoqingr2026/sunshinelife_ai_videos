/** 成片 / Remotion / Manim 共用字体预设 */

import type { ThemeConfig } from "./remotion-presets";

export interface FontPreset {
  id: string;
  label: string;
  /** Remotion CSS font-family 栈 */
  remotionFamily: string;
  /** Manim Text() 使用的系统字体名（ECS 需已安装） */
  manimFont: string;
  desc?: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "noto-sans-sc",
    label: "思源黑体（推荐）",
    remotionFamily: '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif',
    manimFont: "Noto Sans SC",
    desc: "清晰现代，适合科普与教学",
  },
  {
    id: "microsoft-yahei",
    label: "微软雅黑",
    remotionFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif',
    manimFont: "Microsoft YaHei",
    desc: "Windows 常见，与 PEP 英语站风格接近",
  },
  {
    id: "pingfang",
    label: "苹方 / 冬青黑",
    remotionFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    manimFont: "PingFang SC",
    desc: "macOS / iOS 风格",
  },
  {
    id: "kaiti",
    label: "楷体（教材感）",
    remotionFamily: '"KaiTi", "STKaiti", "楷体", serif',
    manimFont: "KaiTi",
    desc: "适合语文、古诗词类内容",
  },
  {
    id: "arial",
    label: "Arial 无衬线",
    remotionFamily: 'Arial, Helvetica, "Microsoft YaHei", sans-serif',
    manimFont: "Arial",
    desc: "英文为主或简约风格",
  },
  {
    id: "georgia",
    label: "Georgia 衬线",
    remotionFamily: 'Georgia, "Times New Roman", "Songti SC", serif',
    manimFont: "Georgia",
    desc: "偏正式、阅读感",
  },
];

export const DEFAULT_FONT_PRESET = FONT_PRESETS[0];

export function getFontPreset(id?: string): FontPreset {
  if (!id) return DEFAULT_FONT_PRESET;
  return FONT_PRESETS.find((f) => f.id === id) ?? DEFAULT_FONT_PRESET;
}

/** 将字体预设写入 Remotion theme + Manim 环境 */
export function applyFontPresetToTheme(
  theme: ThemeConfig,
  fontPresetId: string
): ThemeConfig {
  const preset = getFontPreset(fontPresetId);
  return {
    ...theme,
    fontPresetId: preset.id,
    fontFamily: preset.remotionFamily,
    manimCjkFont: preset.manimFont,
  };
}
