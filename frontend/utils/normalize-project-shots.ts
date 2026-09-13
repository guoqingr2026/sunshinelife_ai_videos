/** 与 backend shot-plan-parser normalizeShot 对齐（前端校验用） */

export function normalizeShotClient(raw: {
  type: string;
  label?: string;
  params?: Record<string, unknown>;
  text?: string;
  highlight?: unknown;
  subtitle?: string;
}): { type: string; label: string; params?: Record<string, unknown> } | null {
  const type = String(raw.type || "").trim();
  if (!type) return null;

  const params: Record<string, unknown> = raw.params ? { ...raw.params } : {};
  if (raw.text !== undefined && params.text === undefined) params.text = raw.text;
  if (raw.highlight !== undefined && params.highlight === undefined) params.highlight = raw.highlight;
  if (raw.subtitle !== undefined && params.subtitle === undefined) params.subtitle = raw.subtitle;

  let label = String(raw.label || "").trim();
  const text = String(params.text || "").trim();
  if (!label || label === type) {
    label = text ? (text.length > 28 ? `${text.slice(0, 28)}…` : text) : type;
  }

  return {
    type,
    label,
    params: Object.keys(params).length > 0 ? params : undefined,
  };
}

export function validateProjectShots(
  shots: Array<{ type: string; label?: string; params?: Record<string, unknown>; text?: string }>
): string[] {
  const warnings: string[] = [];
  for (let i = 0; i < shots.length; i++) {
    const n = normalizeShotClient(shots[i] as Parameters<typeof normalizeShotClient>[0]);
    if (!n) continue;
    if (n.type === "typewriter_text" && !String(n.params?.text || "").trim()) {
      warnings.push(`镜头 ${i + 1} typewriter_text 缺少 text 口播内容`);
    }
  }
  return warnings;
}
