import {
  CUSTOM_PYTHON_HELP,
  CUSTOM_PYTHON_CODE_STARTER,
  type CustomPythonEditorState,
} from "../utils/custom-python-params";
import { parseOfficialManimCode } from "../utils/manim-example-apply";

interface Props {
  value: CustomPythonEditorState;
  onChange: (next: CustomPythonEditorState) => void;
}

export default function CustomPythonEditor({ value, onChange }: Props) {
  const patch = (partial: Partial<CustomPythonEditorState>) => onChange({ ...value, ...partial });

  const pasteFromClipboard = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      const parsed = parseOfficialManimCode(raw);
      patch({ className: parsed.class_name, code: parsed.code });
    } catch (e) {
      alert(String(e));
    }
  };

  const loadStarter = () => {
    patch({
      className: "NestedHearts",
      code: CUSTOM_PYTHON_CODE_STARTER,
      extrasJson: "{}",
    });
  };

  return (
    <div className="space-y-3">
      <details className="panel text-xs open:pb-3">
        <summary className="cursor-pointer font-semibold text-ink select-none">
          使用说明（custom_python）
        </summary>
        <pre className="mt-2 text-muted whitespace-pre-wrap leading-relaxed font-sans">{CUSTOM_PYTHON_HELP}</pre>
      </details>

      <div>
        <label className="block text-sm text-muted font-semibold mb-1">
          class_name <span className="font-normal text-muted">（与 class 名一致）</span>
        </label>
        <input
          type="text"
          value={value.className}
          onChange={(e) => patch({ className: e.target.value })}
          placeholder="NestedHearts"
          spellCheck={false}
          className="input-field p-2 font-mono text-sm"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
          <label className="text-sm text-muted font-semibold">Scene 代码（多行 Python）</label>
          <div className="flex gap-2">
            <button type="button" onClick={pasteFromClipboard} className="btn-ghost text-xs">
              从剪贴板粘贴
            </button>
            <button type="button" onClick={loadStarter} className="btn-ghost text-xs">
              嵌套心形模板
            </button>
          </div>
        </div>
        <textarea
          value={value.code}
          onChange={(e) => patch({ code: e.target.value })}
          rows={22}
          spellCheck={false}
          placeholder="class MyScene(Scene):&#10;    def construct(self):&#10;        ..."
          className="input-field p-3 font-mono text-xs leading-relaxed"
        />
        <p className="text-xs text-muted mt-1">
          直接换行编辑即可；提交时系统自动转为后端所需的 <code className="text-primary">params.code</code>。
          无需手写 <code>\n</code> 转义。
        </p>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted font-semibold select-none">
          高级选项 JSON（可选）
        </summary>
        <p className="text-muted mt-1 mb-1">
          例如 <code className="text-primary">renderer</code>: <code>&quot;opengl&quot;</code>（ThreeDScene）、
          <code className="text-primary">title</code> 等；不要重复写 class_name / code。
        </p>
        <textarea
          value={value.extrasJson}
          onChange={(e) => patch({ extrasJson: e.target.value })}
          rows={4}
          spellCheck={false}
          className="input-field p-2 font-mono text-xs w-full"
        />
      </details>
    </div>
  );
}
