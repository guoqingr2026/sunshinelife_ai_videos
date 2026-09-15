export interface ManimRule {
  keywords: string[];
  type: string;
  label: string;
  params?: Record<string, unknown>;
}

export interface ShotSpec {
  type: string;
  label: string;
  params?: Record<string, unknown>;
  /** 成片时间轴占用帧数（30fps）；也可用 durationSeconds */
  durationInFrames?: number;
}

export interface ProjectThemeMeta {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  fontPresetId?: string;
  fontFamily?: string;
  manimCjkFont?: string;
}

export interface ParsedShotPlan {
  title?: string;
  theme?: ProjectThemeMeta;
  aspect?: "16:9" | "9:16";
  rules: ManimRule[];
  shots: ShotSpec[];
  errors: string[];
}

const SHOT_RESERVED_KEYS = new Set([
  "type",
  "label",
  "params",
  "durationInFrames",
  "durationSeconds",
]);

export const COMPOSE_FPS = 30;

export function shotDurationInFrames(raw: Record<string, unknown>): number | undefined {
  if (typeof raw.durationInFrames === "number" && raw.durationInFrames > 0) {
    return Math.round(raw.durationInFrames);
  }
  if (typeof raw.durationSeconds === "number" && raw.durationSeconds > 0) {
    return Math.round(raw.durationSeconds * COMPOSE_FPS);
  }
  return undefined;
}

/** 将 GPT 常写在镜头根级的字段合并进 params，并生成可读 label */
export function normalizeShot(raw: unknown): ShotSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const type = String(s.type || "").trim();
  if (!type) return null;

  const params: Record<string, unknown> =
    typeof s.params === "object" && s.params && !Array.isArray(s.params)
      ? { ...(s.params as Record<string, unknown>) }
      : {};

  for (const [key, value] of Object.entries(s)) {
    if (SHOT_RESERVED_KEYS.has(key) || value === undefined || value === null) continue;
    if (!(key in params)) params[key] = value;
  }

  let label = String(s.label || "").trim();
  const text = String(params.text || "").trim();
  if (!label || label === type) {
    if (text) {
      label = text.length > 28 ? `${text.slice(0, 28)}…` : text;
    } else {
      label = type;
    }
  }

  const durationInFrames = shotDurationInFrames(s);

  return {
    type,
    label,
    params: Object.keys(params).length > 0 ? params : undefined,
    durationInFrames,
  };
}

/** 导出时把常用字段还原到镜头根级（便于 GPT 再编辑） */
export function expandShotForExport(shot: ShotSpec): Record<string, unknown> {
  const out: Record<string, unknown> = { type: shot.type, label: shot.label };
  const params = shot.params ? { ...shot.params } : {};

  if (shot.type === "typewriter_text") {
    if (params.text !== undefined) out.text = params.text;
    if (params.highlight !== undefined) out.highlight = params.highlight;
    if (params.subtitle !== undefined) out.subtitle = params.subtitle;
    delete params.text;
    delete params.highlight;
    delete params.subtitle;
  }

  if (Object.keys(params).length > 0) out.params = params;
  return out;
}

function normalizeRule(raw: unknown): ManimRule | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const type = String(r.type || "").trim();
  const label = String(r.label || type).trim();
  if (!type) return null;
  let keywords: string[] = [];
  if (Array.isArray(r.keywords)) {
    keywords = r.keywords.map((k) => String(k).trim()).filter(Boolean);
  } else if (typeof r.keywords === "string") {
    keywords = r.keywords.split(/[,，、|]/).map((k) => k.trim()).filter(Boolean);
  }
  return {
    keywords,
    type,
    label,
    params: typeof r.params === "object" && r.params ? (r.params as Record<string, unknown>) : undefined,
  };
}

function normalizeTheme(raw: unknown): ProjectThemeMeta | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const t = raw as Record<string, unknown>;
  const theme: ProjectThemeMeta = {};
  if (typeof t.name === "string") theme.name = t.name;
  if (typeof t.primaryColor === "string") theme.primaryColor = t.primaryColor;
  if (typeof t.secondaryColor === "string") theme.secondaryColor = t.secondaryColor;
  if (typeof t.backgroundColor === "string") theme.backgroundColor = t.backgroundColor;
  if (typeof t.accentColor === "string") theme.accentColor = t.accentColor;
  if (typeof t.fontPresetId === "string") theme.fontPresetId = t.fontPresetId;
  if (typeof t.fontFamily === "string") theme.fontFamily = t.fontFamily;
  if (typeof t.manimCjkFont === "string") theme.manimCjkFont = t.manimCjkFont;
  return Object.keys(theme).length > 0 ? theme : undefined;
}

/** 从文本中提取 JSON 字符串（兼容 GPT 多种粘贴格式） */
export function extractJsonString(article: string): string | null {
  const trimmed = article.trim();
  if (!trimmed) return null;

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]?.trim()) return fenceMatch[1].trim();

  const jsonLabelMatch = trimmed.match(/^json\s*[\r\n]+([\s\S]+)$/i);
  if (jsonLabelMatch?.[1]?.trim()) return jsonLabelMatch[1].trim();

  if (trimmed.startsWith("{")) return trimmed;

  const start = trimmed.indexOf("{");
  if (start >= 0) {
    const block = extractBalancedBraces(trimmed, start);
    if (block) return block;
  }

  return null;
}

function extractBalancedBraces(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export function parseJsonPayload(jsonStr: string): ParsedShotPlan {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== "object") {
      return { rules: [], shots: [], errors: ["JSON 根节点必须是对象"] };
    }
    const title = typeof data.title === "string" ? data.title.trim() : undefined;
    const theme = normalizeTheme(data.theme);
    const aspectRaw = typeof data.aspect === "string" ? data.aspect.trim() : "";
    const aspect =
      aspectRaw === "9:16" || aspectRaw === "16:9"
        ? (aspectRaw as "16:9" | "9:16")
        : undefined;
    const rules: ManimRule[] = Array.isArray(data.rules)
      ? (data.rules.map(normalizeRule).filter(Boolean) as ManimRule[])
      : [];
    const shots: ShotSpec[] = Array.isArray(data.shots)
      ? (data.shots.map(normalizeShot).filter(Boolean) as ShotSpec[])
      : [];
    if (rules.length === 0 && shots.length === 0) {
      return {
        title,
        theme,
        aspect,
        rules,
        shots,
        errors: ["JSON 已识别，但 rules / shots 为空或格式不对"],
      };
    }
    return { title, theme, aspect, rules, shots, errors: [] };
  } catch (e) {
    return { rules: [], shots: [], errors: [`JSON 语法错误: ${e}`] };
  }
}

function parseJsonFromArticle(article: string): ParsedShotPlan | null {
  const jsonStr = extractJsonString(article);
  if (!jsonStr) return null;
  return parseJsonPayload(jsonStr);
}

/** 行格式: 关键词1, 关键词2 → type_id | 标签 */
function parseRuleLine(line: string): ManimRule | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("}")) return null;

  const arrowMatch = trimmed.match(/^(.+?)\s*→\s*([^\s|]+)\s*(?:\|\s*(.+))?$/);
  if (arrowMatch) {
    const keywords = arrowMatch[1]
      .split(/[,，、|]/)
      .map((k) => k.trim())
      .filter(Boolean);
    const type = arrowMatch[2].trim();
    const label = (arrowMatch[3] || type).trim();
    return { keywords, type, label };
  }

  const pipeMatch = trimmed.match(/^(.+?)\s*\|\s*([^\s|]+)\s*\|\s*(.+)$/);
  if (pipeMatch) {
    const keywords = pipeMatch[1]
      .split(/[,，、]/)
      .map((k) => k.trim())
      .filter(Boolean);
    return { keywords, type: pipeMatch[2].trim(), label: pipeMatch[3].trim() };
  }

  return null;
}

/** 镜头行: 1. type_id | 标签  或  manim: type_id | 标签 */
export function parseShotLine(line: string): ShotSpec | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("#") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("}") || trimmed.startsWith('"')) return null;

  const numbered = trimmed.match(
    /^(?:\d+[.)]\s*|[-*•]\s*|manim[:：]\s*)?([a-z_][a-z0-9_]*)\s*\|\s*(.+)$/i
  );
  if (numbered) {
    const label = numbered[2].replace(/[（(].*[）)]\s*$/, "").trim();
    return { type: numbered[1].trim().toLowerCase(), label };
  }

  const simple = trimmed.match(/^(?:\d+[.)]\s*|[-*•]\s*)?([a-z_]+)\s*$/i);
  if (simple) {
    return { type: simple[1].trim(), label: simple[1].trim() };
  }

  return null;
}

function extractSection(article: string, headers: string[]): string {
  const lines = article.split(/\n/);
  let inSection = false;
  const collected: string[] = [];

  for (const line of lines) {
    const header = line.match(/^#{1,3}\s+(.+)/);
    if (header) {
      const title = header[1].trim();
      if (headers.some((h) => title.includes(h))) {
        inSection = true;
        continue;
      }
      if (inSection) break;
    }
    if (inSection) collected.push(line);
  }
  return collected.join("\n");
}

/** 解析 Markdown 文章为规则与镜头序列 */
export function parseShotPlanArticle(article: string): ParsedShotPlan {
  const jsonResult = parseJsonFromArticle(article);
  if (jsonResult) {
    return jsonResult;
  }

  const errors: string[] = [];
  const rules: ManimRule[] = [];
  const shots: ShotSpec[] = [];

  const rulesSection = extractSection(article, ["关键词规则", "规则", "关键词映射", "Manim规则"]);
  const rulesBody = rulesSection || article;

  for (const line of rulesBody.split(/\n/)) {
    const rule = parseRuleLine(line);
    if (rule) rules.push(rule);
  }

  const shotsSection = extractSection(article, ["镜头序列", "镜头列表", "分镜", "镜头规划"]);
  const shotsBody = shotsSection || "";

  for (const line of shotsBody.split(/\n/)) {
    const shot = parseShotLine(line);
    if (shot) shots.push(shot);
  }

  if (rules.length === 0 && shots.length === 0) {
    errors.push(
      "未解析到规则或镜头。支持：① 完整项目 JSON（含 title/theme/shots）② ```json``` ③ 行格式「关键词 → type | 标签」"
    );
  }

  return { rules, shots, errors };
}
