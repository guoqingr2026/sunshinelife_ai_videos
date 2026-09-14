import { useMemo, useState } from "react";
import type { ManimSceneExample, ManimExampleCategory } from "./ManimExampleGallery";
import {
  buildExampleCatalogRows,
  type ExampleCatalogRow,
} from "../utils/manim-example-catalog";

interface Props {
  examples: ManimSceneExample[];
  categories: ManimExampleCategory[];
  currentType: string;
  selectedExampleId?: string;
  onSelect: (example: ManimSceneExample) => void;
}

export default function ManimExampleCatalogTable({
  examples,
  categories,
  currentType,
  selectedExampleId,
  onSelect,
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const userIds = useMemo(
    () => new Set(examples.filter((e) => e.category === "user").map((e) => e.id)),
    [examples]
  );

  const rows = useMemo(
    () => buildExampleCatalogRows(examples, categories, userIds),
    [examples, categories, userIds]
  );

  const typeOptions = useMemo(() => Array.from(new Set(examples.map((e) => e.type))).sort(), [examples]);

  const filtered = useMemo(() => {
    let list = rows;
    if (categoryFilter !== "all") {
      list = list.filter((r) => r.example.category === categoryFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((r) => r.example.type === typeFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.example.label.toLowerCase().includes(q) ||
          r.example.type.toLowerCase().includes(q) ||
          r.sceneKey.toLowerCase().includes(q) ||
          (r.example.desc || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, categoryFilter, typeFilter, query]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="panel space-y-3">
      <div>
        <h3 className="font-bold text-ink text-sm">场景示例对照表（{examples.length}）</h3>
        <p className="text-xs text-muted mt-1">
          每行对应一个示例 → <code className="text-primary">type</code> + 可改 <code className="text-primary">params</code>。
          点击行应用；✓ 表示该示例 JSON 已含此字段。
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索示例名 / type / scene…"
        className="input-field p-2 text-xs w-full"
      />

      <div className="flex flex-wrap gap-1 text-[10px]">
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

      <div className="flex flex-wrap gap-1 text-[10px] max-h-24 overflow-y-auto">
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

      <div className="overflow-auto max-h-[min(70vh,520px)] border border-border rounded-lg">
        <table className="w-full text-xs text-left border-collapse min-w-[640px]">
          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
            <tr className="border-b border-border text-muted">
              <th className="p-2 w-8">#</th>
              <th className="p-2 min-w-[120px]">示例</th>
              <th className="p-2 min-w-[100px]">type</th>
              <th className="p-2 min-w-[72px]">分类</th>
              <th className="p-2 min-w-[80px]">scene</th>
              <th className="p-2 min-w-[200px]">可修改 params（type 级）</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <CatalogRow
                key={row.example.id}
                index={idx + 1}
                row={row}
                active={row.example.type === currentType}
                selected={row.example.id === selectedExampleId}
                expanded={expandedId === row.example.id}
                onSelect={() => onSelect(row.example)}
                onToggleExpand={() => toggleExpand(row.example.id)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-xs text-muted p-4 text-center">无匹配示例，请调整筛选。</p>
        )}
      </div>

      <p className="text-[10px] text-muted">
        复杂场景：选 <code className="text-primary">custom_python</code> 自写 Scene，或保存到「我的示例库」。
        新 type 需改仓库 <code>template_catalog.py</code>；个人示例无需部署。
      </p>
    </div>
  );
}

function CatalogRow({
  index,
  row,
  active,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
}: {
  index: number;
  row: ExampleCatalogRow;
  active: boolean;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  const { example, categoryLabel, sceneKey, paramHelpLines, isUser } = row;
  const preview = paramHelpLines
    .filter((p) => p.help)
    .slice(0, 4)
    .map((p) => `${p.key}${p.inExample ? "✓" : ""}`)
    .join(" · ");

  return (
    <>
      <tr
        className={`border-b border-border/60 cursor-pointer transition-colors ${
          selected ? "bg-primary/15" : active ? "bg-primary/8" : "hover:bg-primary/5"
        }`}
        onClick={onSelect}
      >
        <td className="p-2 text-muted align-top">{index}</td>
        <td className="p-2 align-top">
          <div className="font-medium text-ink leading-snug">{example.label}</div>
          {example.desc && <div className="text-muted mt-0.5 leading-snug">{example.desc}</div>}
          {isUser && (
            <span className="badge bg-green-50 text-green-800 border-green-200 text-[10px] mt-1">我的</span>
          )}
          {example.needsOpengl && (
            <span className="badge bg-purple-50 text-purple-800 border-purple-200 text-[10px] mt-1 ml-1">
              3D
            </span>
          )}
        </td>
        <td className="p-2 font-mono text-[10px] text-primary align-top break-all">{example.type}</td>
        <td className="p-2 text-muted align-top whitespace-nowrap">{categoryLabel}</td>
        <td className="p-2 font-mono text-[10px] align-top break-all">{sceneKey || "—"}</td>
        <td className="p-2 align-top">
          <div className="text-muted leading-relaxed">{preview || "—"}</div>
          {paramHelpLines.length > 4 && (
            <button
              type="button"
              className="text-primary underline mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {expanded ? "收起" : `全部 ${paramHelpLines.length} 项`}
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-surface/80">
          <td colSpan={6} className="p-3">
            <ParamHelpDetail row={row} />
          </td>
        </tr>
      )}
    </>
  );
}

function ParamHelpDetail({ row }: { row: ExampleCatalogRow }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div>
        <p className="text-[10px] font-semibold text-muted mb-1">本示例 params 字段</p>
        <pre className="code-block text-[10px] max-h-32 overflow-auto">
          {JSON.stringify(row.example.params, null, 2)}
        </pre>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted mb-1">type 可修改参数说明</p>
        <ul className="text-[10px] space-y-1 max-h-40 overflow-auto">
          {row.paramHelpLines.map((p) => (
            <li key={p.key}>
              <code className="text-primary">{p.key}</code>
              {p.inExample && <span className="text-green-600 ml-1">✓</span>}
              {p.help && <span className="text-muted"> — {p.help}</span>}
            </li>
          ))}
          {row.paramHelpLines.length === 0 && (
            <li className="text-muted">该 type 无 paramHelp；custom_python 用 class_name + code。</li>
          )}
        </ul>
      </div>
    </div>
  );
}
