import fs from "fs";
import path from "path";
import { getStorageRoot } from "../../lib/storage";
import { DEFAULT_MANIM_RULES } from "./plan-timeline-defaults";
import { buildDefaultShotPlanArticle } from "./shot-plan-spec";
import {
  ManimRule,
  ProjectThemeMeta,
  ShotSpec,
  parseShotPlanArticle,
} from "./shot-plan-parser";

export interface ShotPlanConfig {
  article: string;
  title?: string;
  theme?: ProjectThemeMeta;
  aspect?: "16:9" | "9:16";
  rules: ManimRule[];
  shots: ShotSpec[];
  updatedAt: string;
}

const SHOT_PLAN_PATH = path.join(getStorageRoot(), "shot-plan.json");

export const DEFAULT_SHOT_PLAN_ARTICLE = buildDefaultShotPlanArticle();

function readConfigFile(): ShotPlanConfig | null {
  try {
    if (fs.existsSync(SHOT_PLAN_PATH)) {
      return JSON.parse(fs.readFileSync(SHOT_PLAN_PATH, "utf-8")) as ShotPlanConfig;
    }
  } catch {
    // ignore corrupt file
  }
  return null;
}

export function getShotPlanConfig(): ShotPlanConfig {
  const stored = readConfigFile();
  if (stored && (stored.shots?.length || stored.rules?.length)) return stored;

  const parsed = parseShotPlanArticle(DEFAULT_SHOT_PLAN_ARTICLE);
  return {
    article: DEFAULT_SHOT_PLAN_ARTICLE,
    rules: parsed.rules.length > 0 ? parsed.rules : DEFAULT_MANIM_RULES,
    shots: parsed.shots,
    updatedAt: new Date().toISOString(),
  };
}

export function saveShotPlanArticle(article: string): ShotPlanConfig {
  const parsed = parseShotPlanArticle(article);
  const rules =
    parsed.rules.length > 0
      ? parsed.rules
      : getShotPlanConfig().rules.length > 0
        ? getShotPlanConfig().rules
        : DEFAULT_MANIM_RULES;

  const config: ShotPlanConfig = {
    article,
    title: parsed.title,
    theme: parsed.theme,
    aspect: parsed.aspect,
    rules,
    shots: parsed.shots,
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(SHOT_PLAN_PATH), { recursive: true });
  fs.writeFileSync(SHOT_PLAN_PATH, JSON.stringify(config, null, 2), "utf-8");
  return config;
}

export function getActiveManimRules(): ManimRule[] {
  const config = getShotPlanConfig();
  const merged = [...config.rules];
  const types = new Set(merged.map((r) => r.type));
  for (const def of DEFAULT_MANIM_RULES) {
    if (!types.has(def.type)) merged.push(def);
  }
  return merged;
}

export function getFixedShots(): ShotSpec[] {
  return getShotPlanConfig().shots;
}
