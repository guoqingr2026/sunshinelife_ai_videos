/** 与 backend shot-plan-parser normalizeShot 对齐（前端校验用） */

const SHOT_RESERVED_KEYS = new Set([
  "type",
  "label",
  "params",
  "durationInFrames",
  "durationSeconds",
]);

export function normalizeShotClient(raw: {
  type: string;
  label?: string;
  params?: Record<string, unknown>;
  text?: string;
  highlight?: unknown;
  subtitle?: string;
  scene?: string;
  [key: string]: unknown;
}): { type: string; label: string; params?: Record<string, unknown> } | null {
  const type = String(raw.type || "").trim();
  if (!type) return null;

  const params: Record<string, unknown> =
    raw.params && typeof raw.params === "object" && !Array.isArray(raw.params)
      ? { ...raw.params }
      : {};

  for (const [key, value] of Object.entries(raw)) {
    if (SHOT_RESERVED_KEYS.has(key) || value === undefined || value === null) continue;
    if (!(key in params)) params[key] = value;
  }

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
    if (n.type === "manim_custom" && !String(n.params?.scene || "").trim()) {
      warnings.push(
        `镜头 ${i + 1} manim_custom 缺少 params.scene（如 LorenzScene、CardioidScene）`
      );
    }
    if (n.type === "custom_python" && !String(n.params?.code || "").trim()) {
      warnings.push(
        `镜头 ${i + 1} custom_python 缺少 params.code（完整 Scene 类定义）`
      );
    }
  }
  return warnings;
}
