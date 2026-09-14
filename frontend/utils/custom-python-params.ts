/** custom_python 页面编辑态 ↔ 后端 params 互转 */

export interface CustomPythonEditorState {
  className: string;
  code: string;
  /** 除 class_name / code 外的可选字段，如 renderer、title */
  extrasJson: string;
}

export const CUSTOM_PYTHON_HELP = `使用说明（custom_python）
────────────────────────
1. 类名：与下方 Python 里 class Xxx(Scene) 的 Xxx 完全一致。
2. Scene 代码：只粘贴 class 定义即可；无需写 from manim import *（系统会自动注入）。
3. 迭代 / 循环 / 多图形：在 construct() 里写普通 Python（for、列表、lambda 等均可）。
4. ThreeDScene：类名与 class_name 一致；系统自动用 OpenGL + xvfb。
5. MathTex：ECS 需 install-texlive-optional.sh。
6. 一键成片：shots[] 里写 type=custom_python，把 class_name + code 放在 params 内（code 为单行 JSON 字符串时可含 \\n）。

推荐：从下方「示例画廊」点 NestedHearts · 嵌套心形 → 应用到任务，再改颜色或层数。`;

export const CUSTOM_PYTHON_CODE_STARTER = `class NestedHearts(Scene):
    def construct(self):
        # 向内画 5 个心形，每层缩小、换色
        colors = ["#fb7299", "#23ade5", "#ffe066", "#50c878", "#9b59b6"]
        for i, hex_c in enumerate(colors):
            sc = 1.0 - i * 0.16  # 每层缩小 16%
            heart = ParametricFunction(
                lambda t, s=sc: np.array([
                    s * 16 * np.sin(t) ** 3 / 16,
                    s * (13 * np.cos(t) - 5 * np.cos(2 * t) - 2 * np.cos(3 * t) - np.cos(4 * t)) / 16,
                    0,
                ]),
                t_range=[0, TAU],
                color=hex_c,
                fill_color=hex_c,
                fill_opacity=0.45,
                stroke_width=3,
            )
            self.play(Create(heart), run_time=0.9)
        self.wait(1)`;

export function defaultCustomPythonEditorState(): CustomPythonEditorState {
  return {
    className: "NestedHearts",
    code: CUSTOM_PYTHON_CODE_STARTER,
    extrasJson: "{}",
  };
}

export function paramsToCustomPythonEditor(params: Record<string, unknown>): CustomPythonEditorState {
  const { class_name, code, ...rest } = params;
  const extras = { ...rest };
  delete extras.cjk_font;
  return {
    className: class_name != null ? String(class_name) : "",
    code: code != null ? String(code) : "",
    extrasJson: Object.keys(extras).length > 0 ? JSON.stringify(extras, null, 2) : "{}",
  };
}

export function customPythonEditorToParams(state: CustomPythonEditorState): Record<string, unknown> {
  const className = state.className.trim();
  const code = state.code.trim();
  if (!code) {
    throw new Error("请填写 Scene 代码");
  }
  if (!className) {
    throw new Error("请填写 class_name（与 class 名一致）");
  }

  let extras: Record<string, unknown> = {};
  const raw = state.extrasJson.trim();
  if (raw && raw !== "{}") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        extras = parsed as Record<string, unknown>;
      } else {
        throw new Error("高级选项必须是 JSON 对象");
      }
    } catch (e) {
      throw new Error(`高级选项 JSON 无效：${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    ...extras,
    class_name: className,
    code,
  };
}

/** 从旧版「整段 params JSON」导入（兼容一键粘贴） */
export function tryParseLegacyParamsJson(json: string): CustomPythonEditorState | null {
  try {
    const params = JSON.parse(json) as Record<string, unknown>;
    if (params.code || params.class_name) {
      return paramsToCustomPythonEditor(params);
    }
    return null;
  } catch {
    return null;
  }
}
