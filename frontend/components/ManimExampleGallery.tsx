import { useMemo, useState } from "react";

export interface ManimSceneExample {
  id: string;
  label: string;
  category: string;
  type: string;
  needsOpengl?: boolean;
  desc?: string;
  durationSeconds?: number;
  params: Record<string, unknown>;
}

export interface ManimExampleCategory {
  id: string;
  label: string;
}

interface ManimExampleGalleryProps {
  examples: ManimSceneExample[];
  categories: ManimExampleCategory[];
  currentType: string;
  onSelect: (example: ManimSceneExample) => void;
  compact?: boolean;
}

export default function ManimExampleGallery({
  examples,
  categories,
  currentType,
  onSelect,
  compact = false,
}: ManimExampleGalleryProps) {
  const [open, setOpen] = useState(!compact);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const typeOptions = useMemo(() => {
    const types = new Set(examples.map((e) => e.type));
    return Array.from(types).sort();
  }, [examples]);

  const filtered = useMemo(() => {
    let list = examples;
    if (categoryFilter !== "all") {
      list = list.filter((e) => e.category === categoryFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((e) => e.type === typeFilter);
    }
    return list;
  }, [examples, categoryFilter, typeFilter]);

  if (examples.length === 0) return null;

  return (
    <div className="panel space-y-3">
      <button
        type="button"
        className="w-full flex flex-wrap items-center justify-between gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-ink">
          {compact
            ? `快捷示例（${examples.length}）`
            : `场景示例库（${examples.length}）— 点击即切换类型并填入 JSON`}
        </span>
        <span className="flex items-center gap-2 text-xs text-muted shrink-0">
          <span>当前场景：{currentType}</span>
          <span>{open ? "收起" : "展开"}</span>
        </span>
      </button>

      {open && !compact && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={categoryFilter === "all" ? "pill-tab pill-tab-active" : "pill-tab"}
          >
            全部分类
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={categoryFilter === c.id ? "pill-tab pill-tab-active" : "pill-tab"}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {open && !compact && typeOptions.length > 1 && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={typeFilter === "all" ? "pill-tab pill-tab-active" : "pill-tab"}
          >
            全部 type
          </button>
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? "pill-tab pill-tab-active" : "pill-tab"}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {open && (
      <div className={`grid gap-2 ${compact ? "grid-cols-1 max-h-64 overflow-y-auto" : "grid-cols-1 sm:grid-cols-2"}`}>
        {filtered.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelect(ex)}
            className={`text-left rounded-lg border px-3 py-2 transition-colors ${
              ex.type === currentType
                ? "border-primary bg-primary/10"
                : "border-border bg-surface hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-ink">{ex.label}</span>
              <span className="badge bg-surface text-muted border-border font-mono text-[10px]">
                {ex.type}
              </span>
              {ex.needsOpengl && (
                <span className="badge bg-purple-50 text-purple-800 border-purple-200 text-[10px]">
                  3D
                </span>
              )}
              {ex.type === "manim_custom" && typeof ex.params.scene === "string" && (
                <span className="badge bg-blue-50 text-blue-800 border-blue-200 font-mono text-[10px]">
                  {String(ex.params.scene)}
                </span>
              )}
            </div>
            {ex.desc && <p className="text-xs text-muted mt-1 leading-snug">{ex.desc}</p>}
          </button>
        ))}
      </div>
      )}

      {open && filtered.length === 0 && (
        <p className="text-xs text-muted">当前筛选无示例，请切换分类或 type。</p>
      )}
    </div>
  );
}
