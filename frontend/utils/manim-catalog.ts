import {
  MANIM_CAPABILITIES,
  MANIM_CAPABILITY_CATEGORIES,
  getCapability,
  getExampleParams,
  type ManimCapability,
} from "./manim-capabilities";

export type { ManimCapability };
export { MANIM_CAPABILITY_CATEGORIES as MANIM_CATEGORIES, getCapability, getExampleParams };

export interface ManimParamField {
  key: string;
  label: string;
  type: "text" | "number" | "string_list";
}

export interface ManimTemplate {
  id: string;
  label: string;
  desc: string;
  category: string;
  layer: 1 | 2 | 3;
  primitives: string[];
  officialExample?: { title: string; url: string };
  defaultParams: Record<string, unknown>;
  paramHelp: Record<string, string>;
}

export const MANIM_TEMPLATES: ManimTemplate[] = MANIM_CAPABILITIES.map((c) => ({
  id: c.id,
  label: c.label,
  desc: c.desc,
  category: c.category,
  layer: c.layer,
  primitives: c.primitives,
  officialExample: c.officialExample,
  defaultParams: c.defaultParams,
  paramHelp: c.paramHelp,
}));

export function getManimTemplate(id: string): ManimTemplate | undefined {
  return MANIM_TEMPLATES.find((t) => t.id === id);
}

export function getDefaultParams(id: string): Record<string, unknown> {
  return getExampleParams(id);
}
