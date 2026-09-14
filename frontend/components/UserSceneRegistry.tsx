import { useCallback, useEffect, useState } from "react";
import type { ManimSceneExample } from "./ManimExampleGallery";
import {
  addUserSceneExample,
  exportUserExamplesJson,
  importUserExamplesJson,
  loadUserSceneExamples,
  removeUserSceneExample,
  userExampleToSceneExample,
  type UserSceneExample,
} from "../utils/user-scene-examples";

export interface CurrentSceneConfig {
  type: string;
  label: string;
  params: Record<string, unknown>;
  needsOpengl?: boolean;
}

interface Props {
  onApply: (example: ManimSceneExample) => void;
  getCurrentConfig: () => CurrentSceneConfig;
  onChange?: () => void;
}

export default function UserSceneRegistry({ onApply, getCurrentConfig, onChange }: Props) {
  const [items, setItems] = useState<UserSceneExample[]>([]);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(true);

  const refresh = useCallback(() => setItems(loadUserSceneExamples()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = () => {
    const cfg = getCurrentConfig();
    const name = label.trim() || `${cfg.type} · ${new Date().toLocaleString("zh-CN")}`;
    addUserSceneExample({
      label: name,
      type: cfg.type,
      category: "user",
      desc: note.trim() || `保存自 Manim 页 · ${cfg.type}`,
      needsOpengl: cfg.needsOpengl,
      params: cfg.params,
    });
    setLabel("");
    setNote("");
    refresh();
    onChange?.();
  };

  const handleExport = () => {
    const blob = new Blob([exportUserExamplesJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-manim-scene-examples.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const n = importUserExamplesJson(text);
        refresh();
        onChange?.();
        alert(`已导入 ${n} 条示例`);
      } catch (e) {
        alert(String(e));
      }
    };
    input.click();
  };

  return (
    <div className="panel space-y-3">
      <button
        type="button"
        className="w-full flex justify-between items-center text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-bold text-ink text-sm">我的示例库（{items.length}）— 浏览器本地注册</span>
        <span className="text-xs text-muted">{open ? "收起" : "展开"}</span>
      </button>

      {open && (
        <>
          <p className="text-xs text-muted leading-relaxed">
            无需改服务器即可保存当前 type + params（含 custom_python 代码）。
            数据存在本机 localStorage；可导出 JSON 备份。一键成片可在 shots 里复用相同 params。
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="input-field p-2 text-xs"
              placeholder="示例名称（可选）"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <input
              className="input-field p-2 text-xs"
              placeholder="备注（可选）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} className="btn-primary text-xs py-1.5 px-3">
              保存当前配置
            </button>
            <button type="button" onClick={handleExport} className="btn-ghost text-xs">
              导出 JSON
            </button>
            <button type="button" onClick={handleImport} className="btn-ghost text-xs">
              导入 JSON
            </button>
          </div>

          {items.length > 0 && (
            <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
              {items.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2 border border-border rounded px-2 py-1.5"
                >
                  <button
                    type="button"
                    className="text-left flex-1 min-w-0"
                    onClick={() => onApply(userExampleToSceneExample(u))}
                  >
                    <span className="font-medium text-ink">{u.label}</span>
                    <span className="text-muted ml-2 font-mono text-[10px]">{u.type}</span>
                  </button>
                  <button
                    type="button"
                    className="text-red-500 shrink-0"
                    onClick={() => {
                      removeUserSceneExample(u.id);
                      refresh();
                      onChange?.();
                    }}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
