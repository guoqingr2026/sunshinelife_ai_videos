import { getShotPlanConfig } from "./shot-plan-store";
import {
  expandShotForExport,
  extractJsonString,
  parseJsonPayload,
  ShotSpec,
} from "./shot-plan-parser";

export interface ComposeProjectExport {
  title: string;
  theme?: Record<string, unknown>;
  aspect?: "16:9" | "9:16";
  shots: Record<string, unknown>[];
  projectJson: string;
  shotCount: number;
  updatedAt?: string;
}

function titleFromArticle(article: string, storedTitle?: string): string {
  if (storedTitle?.trim()) return storedTitle.trim();
  const jsonStr = extractJsonString(article);
  if (jsonStr) {
    try {
      const parsed = parseJsonPayload(jsonStr);
      if (parsed.title) return parsed.title;
    } catch {
      /* fall through */
    }
  }
  const lines = article.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("#")) {
      const t = line.replace(/^#+\s*/, "").trim();
      if (t && t.length <= 60) return t;
    }
  }
  return "科普视频";
}

export function buildComposeProjectFromShotPlan(): ComposeProjectExport | null {
  const config = getShotPlanConfig();
  if (!config.shots?.length) return null;

  const title = titleFromArticle(config.article, config.title);
  const shots = config.shots.map((s) => expandShotForExport(s));
  const project: Record<string, unknown> = { title, shots };
  if (config.theme) project.theme = config.theme;
  if (config.aspect) project.aspect = config.aspect;

  return {
    title,
    theme: config.theme as Record<string, unknown> | undefined,
    aspect: config.aspect,
    shots,
    projectJson: JSON.stringify(project, null, 2),
    shotCount: config.shots.length,
    updatedAt: config.updatedAt,
  };
}
