import { useMemo, useState } from "react";

export interface ManimSceneExample {
  id: string;
  label: string;
  category: string;
  type: string;
  needsOpengl?: boolean;
  desc?: string;
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const relevant = useMemo(() => {
    if (currentType === "manim_custom") {
      return examples.filter((e) => e.type === "manim_custom");
    }
    return examples.filter((e) => e.type === currentType);
  }, [examples, currentType]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return relevant;
    return relevant.filter((e) => e.category === categoryFilter);
  }, [relevant, categoryFilter]);

  const usedCategories = useMemo(() => {
    const ids = new Set(relevant.map((e) => e.category));
    return categories.filter((c) => ids.has(c.id));
  }, [relevant, categories]);

  if (relevant.length === 0) return null;

  return (
    <div className="panel space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {currentType === "manim_custom" ? "数学宇宙示例库" : "场景示例"}
        </p>
        <p className="text-xs text-muted">点击填入参数 JSON，再按需修改</p>
      </div>

      {!compact && usedCategories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={categoryFilter === "all" ? "pill-tab pill-tab-active" : "pill-tab"}
          >
            全部
          </button>
          {usedCategories.map((c) => (
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

      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {filtered.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelect(ex)}
            className="text-left rounded-lg border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 px-3 py-2 transition-colors"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-ink">{ex.label}</span>
              {ex.needsOpengl && (
                <span className="badge bg-purple-50 text-purple-800 border-purple-200 text-[10px]">
                  3D
                </span>
              )}
              {ex.type === "manim_custom" && typeof ex.params.scene === "string" && (
                <span className="badge bg-blue-50 text-blue-800 border-blue-200 font-mono text-[10px]">
                  {ex.params.scene}
                </span>
              )}
            </div>
            {ex.desc && <p className="text-xs text-muted mt-1 leading-snug">{ex.desc}</p>}
          </button>
        ))}
      </div>

      {currentType === "manim_custom" && (
        <p className="text-xs text-muted leading-relaxed">
          高级用法：{" "}
          <code className="text-primary">manim_custom</code> +{" "}
          <code className="text-primary">params.scene</code> 指定场景类名。
          洛伦兹支持 <code className="text-primary">n</code>、
          <code className="text-primary">colors</code>、
          <code className="text-primary">initial_conditions</code>。
          完整列表见 <code className="text-primary">GET /api/manim/universe-scenes</code>。
        </p>
      )}
    </div>
  );
}
