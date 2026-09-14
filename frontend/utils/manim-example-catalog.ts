import type { ManimSceneExample, ManimExampleCategory } from "../components/ManimExampleGallery";
import { getCapability } from "./manim-catalog";

export interface ExampleCatalogRow {
  example: ManimSceneExample;
  categoryLabel: string;
  sceneKey: string;
  exampleParamKeys: string[];
  paramHelpLines: Array<{ key: string; help: string; inExample: boolean }>;
  isUser: boolean;
}

export function buildExampleCatalogRows(
  examples: ManimSceneExample[],
  categories: ManimExampleCategory[],
  userIds: Set<string> = new Set()
): ExampleCatalogRow[] {
  const catMap = new Map(categories.map((c) => [c.id, c.label]));

  return examples.map((ex) => {
    const cap = getCapability(ex.type);
    const paramHelp = cap?.paramHelp ?? {};
    const exampleKeys = Object.keys(ex.params || {});
    const sceneKey =
      ex.type === "manim_custom" && ex.params?.scene
        ? String(ex.params.scene)
        : ex.type === "custom_python" && ex.params?.class_name
          ? String(ex.params.class_name)
          : "";

    const allKeys = new Set([...Object.keys(paramHelp), ...exampleKeys]);
    const paramHelpLines = Array.from(allKeys).map((key) => ({
      key,
      help: paramHelp[key] || (exampleKeys.includes(key) ? "示例已含此字段" : ""),
      inExample: exampleKeys.includes(key),
    }));

    return {
      example: ex,
      categoryLabel: catMap.get(ex.category) || ex.category,
      sceneKey,
      exampleParamKeys: exampleKeys,
      paramHelpLines,
      isUser: userIds.has(ex.id),
    };
  });
}

export function formatParamHelpSummary(row: ExampleCatalogRow, max = 6): string {
  const parts = row.paramHelpLines
    .filter((p) => p.help)
    .slice(0, max)
    .map((p) => `${p.key}${p.inExample ? "✓" : ""}`);
  const more = row.paramHelpLines.length - max;
  return parts.join(" · ") + (more > 0 ? ` …+${more}` : "");
}
