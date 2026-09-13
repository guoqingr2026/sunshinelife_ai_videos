import type { ManimSceneExample } from "./api";

/** 将 Manim 官方文档粘贴的 Python 转为 custom_python 所需 JSON */
export function parseOfficialManimCode(raw: string): { class_name: string; code: string } {
  let text = raw.trim();
  const fence = text.match(/```(?:python)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();

  const classMatch = text.match(/class\s+(\w+)\s*\(\s*(\w+)\s*\)/);
  if (!classMatch) {
    throw new Error("未找到 class 定义，请粘贴完整 Scene 类（参考 docs.manim.community/examples）");
  }
  const class_name = classMatch[1];
  const classStart = text.indexOf(`class ${class_name}`);
  const code = text.slice(classStart).trim();
  return { class_name, code };
}

/** 示例 → 页面可用的 type + params（与后端 render_task 一致） */
export function exampleToTaskPayload(example: ManimSceneExample): {
  type: string;
  params: Record<string, unknown>;
} {
  const params: Record<string, unknown> = { ...(example.params || {}) };

  const durationSeconds = (example as { durationSeconds?: number }).durationSeconds;
  if (durationSeconds != null) {
    params.durationSeconds = durationSeconds;
  }

  if (example.type === "custom_python") {
    if (!params.class_name && typeof params.code === "string") {
      try {
        const parsed = parseOfficialManimCode(String(params.code));
        params.class_name = parsed.class_name;
        params.code = parsed.code;
      } catch {
        /* keep as-is */
      }
    }
    if (params.class_name && params.code && !String(params.code).includes("class ")) {
      params.code = `class ${params.class_name}(Scene):\n    def construct(self):\n        ${params.code}`;
    }
    return { type: "custom_python", params };
  }

  if (example.type === "manim_custom") {
    const scene = params.scene ?? params.class_name;
    if (!scene || !String(scene).trim()) {
      throw new Error(`示例「${example.label}」缺少 params.scene`);
    }
    params.scene = String(scene).trim();
    return { type: "manim_custom", params };
  }

  return { type: example.type, params };
}

export function exampleToParamsJson(example: ManimSceneExample): string {
  const { params } = exampleToTaskPayload(example);
  return JSON.stringify(params, null, 2);
}
