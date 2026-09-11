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

/** 从文本中提取 JSON 字符串（兼容 GPT 多种粘贴格式） */
function extractJsonString(article: string): string | null {
  const trimmed = article.trim();
  if (!trimmed) return null;

  // ```json ... ``` 或 ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]?.trim()) return fenceMatch[1].trim();

  // 单独一行 json 后接对象（GPT 常见）
  const jsonLabelMatch = trimmed.match(/^json\s*[\r\n]+([\s\S]+)$/i);
  if (jsonLabelMatch?.[1]?.trim()) return jsonLabelMatch[1].trim();

  // 全文以 { 开头
  if (trimmed.startsWith("{")) return trimmed;

  // 文中嵌入的第一个完整 JSON 对象
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

function parseJsonPayload(jsonStr: string): ParsedShotPlan {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== "object") {
      return { rules: [], shots: [], errors: ["JSON 根节点必须是对象"] };
    }
    const rules: ManimRule[] = Array.isArray(data.rules)
      ? (data.rules.map(normalizeRule).filter(Boolean) as ManimRule[])
      : [];
    const shots: ShotSpec[] = Array.isArray(data.shots)
      ? (data.shots.map(normalizeShot).filter(Boolean) as ShotSpec[])
      : [];
    if (rules.length === 0 && shots.length === 0) {
      return {
        rules,
        shots,
        errors: ["JSON 已识别，但 rules / shots 为空或格式不对"],
      };
    }
    return { rules, shots, errors: [] };
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
      "未解析到规则或镜头。支持：① ```json``` 代码块 ② 纯 JSON 对象 ③ 行格式「关键词 → type | 标签」"
    );
  }

  return { rules, shots, errors };
}
