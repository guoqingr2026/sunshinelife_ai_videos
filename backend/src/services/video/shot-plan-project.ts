import { getShotPlanConfig } from "./shot-plan-store";
import { ShotSpec } from "./shot-plan-parser";

export interface ComposeProjectExport {
  title: string;
  shots: ShotSpec[];
  projectJson: string;
  shotCount: number;
  updatedAt?: string;
}

function extractTitleFromArticle(article: string): string {
  const lines = article.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("#")) {
      const t = line.replace(/^#+\s*/, "").trim();
      if (t && t.length <= 60) return t;
    }
    if (line.length >= 4 && line.length <= 40 && !line.startsWith("{") && !line.includes("→")) {
      return line.replace(/^[#\-\d.\s]+/, "");
    }
  }
  return "科普视频";
}

export function buildComposeProjectFromShotPlan(): ComposeProjectExport | null {
  const config = getShotPlanConfig();
  if (!config.shots?.length) return null;

  const title = extractTitleFromArticle(config.article);
  const project = { title, shots: config.shots };
  return {
    title,
    shots: config.shots,
    projectJson: JSON.stringify(project, null, 2),
    shotCount: config.shots.length,
    updatedAt: config.updatedAt,
  };
}
