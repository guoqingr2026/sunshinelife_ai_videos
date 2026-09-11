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
}

export interface ParsedShotPlan {
  rules: ManimRule[];
  shots: ShotSpec[];
  errors: string[];
}

/** 从文章正文中解析 JSON 代码块 */
function parseJsonBlock(article: string): ParsedShotPlan | null {
  const match = article.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    const rules: ManimRule[] = Array.isArray(data.rules)
      ? data.rules.map(normalizeRule).filter(Boolean) as ManimRule[]
      : [];
    const shots: ShotSpec[] = Array.isArray(data.shots)
      ? data.shots.map(normalizeShot).filter(Boolean) as ShotSpec[]
      : [];
    return { rules, shots, errors: [] };
  } catch (e) {
    return { rules: [], shots: [], errors: [`JSON 解析失败: ${e}`] };
  }
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

function normalizeShot(raw: unknown): ShotSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const type = String(s.type || "").trim();
  const label = String(s.label || type).trim();
  if (!type) return null;
  return {
    type,
    label,
    params: typeof s.params === "object" && s.params ? (s.params as Record<string, unknown>) : undefined,
  };
}

/** 行格式: 关键词1, 关键词2 → type_id | 标签 */
function parseRuleLine(line: string): ManimRule | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) return null;

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
  const jsonResult = parseJsonBlock(article);
  if (jsonResult && (jsonResult.rules.length > 0 || jsonResult.shots.length > 0)) {
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
    errors.push("未解析到规则或镜头，请检查格式（见页面说明）");
  }

  return { rules, shots, errors };
}
