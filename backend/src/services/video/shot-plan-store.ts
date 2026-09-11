import fs from "fs";
import path from "path";
import { getStorageRoot } from "../../lib/storage";
import { DEFAULT_MANIM_RULES } from "./plan-timeline-defaults";
import { ManimRule, ShotSpec, parseShotPlanArticle } from "./shot-plan-parser";

export interface ShotPlanConfig {
  article: string;
  rules: ManimRule[];
  shots: ShotSpec[];
  updatedAt: string;
}

const SHOT_PLAN_PATH = path.join(getStorageRoot(), "shot-plan.json");

export const DEFAULT_SHOT_PLAN_ARTICLE = `# 镜头规划文章

把 GPT 拆好的镜头贴到下面，保存后「一键成片」会自动读取。

## 关键词规则

每行一条，格式：\`关键词1, 关键词2 → manim类型 | 显示标签\`

pn结, pn → pn_junction | PN 结
能带, 导带 → band_structure | 能带结构
遗忘, 记忆曲线 → forgetting_curve | 遗忘曲线
mosfet, 沟道 → mosfet_channel | MOSFET
学习, 费曼, 间隔重复 → typewriter_text | 学习技巧

## 镜头序列（可选）

若填写此节，一键成片将**按顺序**使用这些 Manim 镜头（不再靠关键词猜）：

1. pn_junction | PN 结原理
2. forgetting_curve | 遗忘曲线
3. typewriter_text | 学习技巧

---

也支持 JSON 代码块（适合整段从 GPT 复制）：

\`\`\`json
{
  "rules": [
    { "keywords": ["pn结"], "type": "pn_junction", "label": "PN 结" }
  ],
  "shots": [
    { "type": "forgetting_curve", "label": "遗忘曲线" }
  ]
}
\`\`\`
`;

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
  if (stored?.rules?.length) return stored;

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
