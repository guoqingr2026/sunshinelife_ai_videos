/**
 * Enrich Manim shot params so label / root fields become editable content,
 * not stuck on locale or code demo defaults.
 *
 * Priority (highest wins): explicit params → seeded from label → (locale/fallback in Python)
 */
export function enrichManimParams(
  type: string,
  label: string,
  params?: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...(params || {}) };
  const lbl = String(label || "").trim();
  if (!lbl || lbl === type) return out;

  const missing = (key: string) => {
    const v = out[key];
    return v === undefined || v === null || (typeof v === "string" && !v.trim());
  };

  // Common title-like fields
  if (missing("title")) out.title = lbl;

  switch (type) {
    case "chapter_banner":
      if (missing("chapter")) out.chapter = lbl;
      if (missing("title")) out.title = lbl;
      break;
    case "typewriter_text":
    case "fade_text":
    case "keyword_pop":
      if (missing("text")) out.text = lbl;
      break;
    case "mathtex_formula":
    case "manim_formula":
      if (missing("formula") && /[=\\^_{}]/.test(lbl)) out.formula = lbl;
      break;
    case "quote":
      if (missing("quote")) out.quote = lbl;
      break;
    default:
      break;
  }

  return out;
}

function strParam(
  params: Record<string, unknown> | undefined,
  key: string,
  fallback: string
): string {
  const v = params?.[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  return fallback;
}

function arrParam<T>(
  params: Record<string, unknown> | undefined,
  key: string,
  fallback: T[]
): T[] {
  const v = params?.[key];
  if (Array.isArray(v) && v.length > 0) return v as T[];
  return fallback;
}

/** Remotion timeline fields: prefer params over label so shots are independently editable */
export function remotionFieldsFromShot(
  type: string,
  label: string,
  params?: Record<string, unknown>,
  durationInFrames?: number
): {
  type: string;
  durationInFrames: number;
  title?: string;
  text?: string;
  quote?: string;
  author?: string;
  items?: string[];
  steps?: string[];
  events?: string[];
  leftTitle?: string;
  rightTitle?: string;
  leftText?: string;
  rightText?: string;
  value?: string;
  label?: string;
  formula?: string;
  caption?: string;
  sourceUrl?: string;
  params?: Record<string, unknown>;
} {
  const p = params || {};
  const dur = durationInFrames;

  switch (type) {
    case "title":
      return {
        type: "title",
        durationInFrames: dur || 120,
        title: strParam(p, "title", label),
        params: p,
      };
    case "chapter":
      return {
        type: "chapter",
        durationInFrames: dur || 90,
        title: strParam(p, "title", label),
        params: p,
      };
    case "subtitle":
      return {
        type: "subtitle",
        durationInFrames: dur || 120,
        text: strParam(p, "text", label),
        title: strParam(p, "title", label),
        params: p,
      };
    case "fade_text":
      return {
        type: "fade_text",
        durationInFrames: dur || 90,
        text: strParam(p, "text", label),
        params: p,
      };
    case "quote":
      return {
        type: "quote",
        durationInFrames: dur || 100,
        quote: strParam(p, "quote", label),
        author: strParam(p, "author", ""),
        params: p,
      };
    case "bullet_list":
      return {
        type: "bullet_list",
        durationInFrames: dur || 120,
        title: strParam(p, "title", label),
        items: arrParam(p, "items", ["要点一", "要点二", "要点三"]),
        params: p,
      };
    case "flow_steps":
      return {
        type: "flow_steps",
        durationInFrames: dur || 150,
        steps: arrParam(p, "steps", ["输入", "理解", "输出"]),
        title: strParam(p, "title", label),
        params: p,
      };
    case "timeline_bar":
      return {
        type: "timeline_bar",
        durationInFrames: dur || 150,
        title: strParam(p, "title", label),
        events: arrParam(p, "events", ["起点", "过程", "终点"]),
        params: p,
      };
    case "formula_card":
      return {
        type: "formula_card",
        durationInFrames: dur || 120,
        formula: strParam(p, "formula", label),
        caption: strParam(p, "caption", ""),
        title: strParam(p, "title", label),
        params: p,
      };
    case "compare":
      return {
        type: "compare",
        durationInFrames: dur || 120,
        leftTitle: strParam(p, "leftTitle", "左侧"),
        rightTitle: strParam(p, "rightTitle", "右侧"),
        leftText: strParam(p, "leftText", ""),
        rightText: strParam(p, "rightText", ""),
        params: p,
      };
    case "stat":
      return {
        type: "stat",
        durationInFrames: dur || 90,
        value: strParam(p, "value", ""),
        label: strParam(p, "label", label),
        params: p,
      };
    case "arrow":
      return {
        type: "arrow",
        durationInFrames: dur || 90,
        title: strParam(p, "title", label),
        params: p,
      };
    case "params":
      return {
        type: "params",
        durationInFrames: dur || 120,
        title: strParam(p, "title", label),
        params: Object.keys(p).length ? p : { 电压: "9V", 电流: "1A" },
      };
    case "remotion_doors":
      return {
        type: "remotion_doors",
        durationInFrames: dur || 150,
        title: strParam(p, "title", label),
        params: p,
      };
    case "remotion_open_door":
      return {
        type: "remotion_open_door",
        durationInFrames: dur || 150,
        title: strParam(p, "title", label),
        params: p,
      };
    case "remotion_car_reveal":
      return {
        type: "remotion_car_reveal",
        durationInFrames: dur || 150,
        title: strParam(p, "title", label),
        params: p,
      };
    case "image_clip":
      return {
        type: "image_clip",
        durationInFrames: dur || 150,
        title: strParam(p, "title", label),
        sourceUrl:
          (typeof p.imagePath === "string" && p.imagePath) ||
          (typeof p.url === "string" && p.url) ||
          "",
        params: p,
      };
    case "composite_split":
    case "composite_pip":
      return {
        type,
        durationInFrames: dur || 150,
        title: strParam(p, "title", label),
        params: p,
      };
    default:
      return {
        type: "chapter",
        durationInFrames: dur || 90,
        title: strParam(p, "title", label),
        params: p,
      };
  }
}
