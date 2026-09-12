import { useEffect, useMemo, useState } from "react";
import { api, ManimStatus, Task } from "../../utils/api";
import {
  MANIM_CATEGORIES,
  MANIM_DOMAINS,
  MANIM_TEMPLATES,
  getExampleParams,
  getManimTemplate,
  getTemplateDomain,
  type ManimDomain,
} from "../../utils/manim-catalog";

type LayerFilter = "all" | 1 | 2 | 3;
type DomainFilter = "all" | ManimDomain;

export default function ManimConfig() {
  const [type, setType] = useState("pn_junction");
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("all");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [paramsJson, setParamsJson] = useState("");
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<ManimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const selected = getManimTemplate(type);

  useEffect(() => {
    api.getManimStatus().then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    setParamsJson(JSON.stringify(getExampleParams(type), null, 2));
  }, [type]);

  useEffect(() => {
    if (!task || task.status === "success" || task.status === "failed") return;
    const timer = setInterval(async () => {
      const updated = await api.getManimTask(task.id);
      setTask(updated);
      if (updated.status === "success" || updated.status === "failed") {
        api.getManimStatus().then(setStatus).catch(() => {});
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [task]);

  const filteredTemplates = useMemo(() => {
    let list = MANIM_TEMPLATES;
    if (domainFilter !== "all") {
      list = list.filter((t) => getTemplateDomain(t.id) === domainFilter);
    }
    if (layerFilter !== "all") {
      list = list.filter((t) => t.layer === layerFilter);
    }
    return list;
  }, [layerFilter, domainFilter]);

  const grouped = useMemo(() => {
    const ids = new Set(filteredTemplates.map((t) => t.id));
    return MANIM_CATEGORIES.map((cat) => ({
      ...cat,
      items: filteredTemplates.filter((t) => t.category === cat.id && ids.has(t.id)),
    })).filter((g) => g.items.length > 0);
  }, [filteredTemplates]);

  const handleSubmit = async () => {
    setLoading(true);
    setVideoError(false);
    try {
      let finalParams: Record<string, unknown>;
      try {
        finalParams = JSON.parse(paramsJson);
      } catch {
        alert("参数 JSON 格式错误");
        setLoading(false);
        return;
      }
      const result = await api.createManimTask({ type, params: finalParams });
      setTask(await api.getManimTask(result.taskId));
    } finally {
      setLoading(false);
    }
  };

  const fillExample = () => setParamsJson(JSON.stringify(getExampleParams(type), null, 2));

  const copyClipUrl = () => task?.outputUrl && navigator.clipboard.writeText(task.outputUrl);
  const copyClipJson = () => task?.clipJson && navigator.clipboard.writeText(JSON.stringify(task.clipJson, null, 2));
  const clipJsonText = task?.clipJson ? JSON.stringify(task.clipJson, null, 2) : "";

  const statusColor = {
    pending: "text-yellow-400",
    running: "text-blue-400",
    success: "text-green-400",
    failed: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manim 动画引擎</h1>
      <p className="text-gray-400 text-sm mb-4">
        四域应用：<strong className="text-white">半导体</strong> · <strong className="text-white">学习</strong> · <strong className="text-white">英语</strong> · <strong className="text-white">媒体/3D</strong>。
        三层能力 L1/L2/L3；覆盖 MathTex（texlive 可选）、ThreeDScene（OpenGL）、SVG/图片/视频。
        生成 <code className="text-primary">.mp4</code> + Remotion <code className="text-primary">manim_clip</code> <code className="text-primary">.json</code>。
      </p>

      {status && (
        <div
          className={`mb-4 p-3 rounded-lg border text-sm ${
            status.manimInstalled
              ? "border-green-700 bg-green-900/20 text-green-300"
              : "border-yellow-700 bg-yellow-900/20 text-yellow-200"
          }`}
        >
          <p className="font-medium">
            {status.manimInstalled ? "✓ 已安装 Manim" : "⚠ 未安装 Manim（占位视频）"}
          </p>
          <p className="text-xs mt-1 opacity-80">{status.hint}</p>
          <p className="text-xs mt-1 opacity-70">
            共 {MANIM_TEMPLATES.length} 种场景 · 自动化手册{" "}
            <code className="text-gray-400">docs/manim-automation-guide.md</code>
            · 配色/背景由 Remotion theme 统一 ·{" "}
            <a
              href="https://docs.manim.community/en/stable/examples.html"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Manim 官方示例
            </a>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-2 text-xs">
        {(["all", ...MANIM_DOMAINS.map((d) => d.id)] as DomainFilter[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDomainFilter(d)}
            className={`px-3 py-1 rounded-full border ${
              domainFilter === d ? "bg-primary border-primary text-white" : "border-gray-600 text-gray-400"
            }`}
          >
            {d === "all" ? "全部域" : MANIM_DOMAINS.find((x) => x.id === d)?.label ?? d}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {(["all", 1, 2, 3] as LayerFilter[]).map((l) => (
          <button
            key={String(l)}
            type="button"
            onClick={() => setLayerFilter(l)}
            className={`px-3 py-1 rounded-full border ${
              layerFilter === l ? "bg-gray-700 border-gray-500 text-white" : "border-gray-600 text-gray-400"
            }`}
          >
            {l === "all" ? "全部层" : `L${l}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">场景类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-darker border border-gray-600 rounded-lg p-2"
            >
              {grouped.map((g) => (
                <optgroup key={g.id} label={g.label}>
                  {g.items.map((t) => (
                    <option key={t.id} value={t.id}>
                      [L{t.layer}] {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {selected && (
            <div className="bg-darker border border-gray-700 rounded-lg p-4 text-sm space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold">{selected.label}</p>
                  <p className="text-gray-500 text-xs mt-1">{selected.desc}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                    L{selected.layer}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-amber-300/90">
                    {MANIM_DOMAINS.find((d) => d.id === getTemplateDomain(selected.id))?.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Manim 原语（能力索引）</p>
                <div className="flex flex-wrap gap-1">
                  {selected.primitives.map((p) => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-blue-300 font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              {selected.officialExample && (
                <p className="text-xs">
                  官方参考：{" "}
                  <a href={selected.officialExample.url} target="_blank" rel="noreferrer" className="text-primary underline">
                    {selected.officialExample.title}
                  </a>
                </p>
              )}
              {Object.keys(selected.paramHelp).length > 0 && (
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {Object.entries(selected.paramHelp).map(([k, v]) => (
                    <li key={k}><code className="text-gray-400">{k}</code> — {v}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400">参数 JSON</label>
              <button type="button" onClick={fillExample} className="text-xs text-primary hover:underline">
                一键填充示例
              </button>
            </div>
            <textarea
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              rows={type === "custom_python" ? 14 : 10}
              spellCheck={false}
              className="w-full bg-darker border border-gray-600 rounded-lg p-3 font-mono text-xs"
            />
            {type === "custom_python" && (
              <p className="text-xs text-yellow-500/90 mt-1">
                粘贴 Manim 官方 Scene 代码。MathTex 需 ECS 安装 texlive；3D 需 install-opengl-deps.sh。
              </p>
            )}
            {(type === "scene_3d_surface" || type === "scene_3d_orbit") && (
              <p className="text-xs text-yellow-500/90 mt-1">
                无显示器环境需 xvfb + Mesa（deploy/ecs/install-opengl-deps.sh）。
              </p>
            )}
            {(type === "mathtex_formula" || type === "mathtex_derivation") && (
              <p className="text-xs text-gray-500 mt-1">
                未装 texlive 时自动文本降级；完整 LaTeX 请运行 install-texlive-optional.sh。
              </p>
            )}
            {type === "custom_dsl" && (
              <p className="text-xs text-gray-500 mt-1">
                objects: circle|rect|text|arrow|dot · timeline: create|fade_in|write|grow_arrow|wait|transform
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "渲染中..." : "生成 Manim 视频"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-darker rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold mb-3">预览</h3>
            {!task ? (
              <p className="text-gray-500 text-sm">提交后在此预览</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>类型: <code className="text-gray-300">{String(task.payload?.type ?? type)}</code></p>
                <p>状态: <span className={statusColor[task.status]}>{task.status}</span></p>
                {task.outputUrl && task.status === "success" && (
                  <>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={copyClipUrl} className="text-primary underline">复制 MP4</button>
                      {task.clipJson && (
                        <button onClick={copyClipJson} className="text-primary underline">复制 JSON</button>
                      )}
                      <a href={task.outputUrl} download className="text-gray-400 underline">下载 MP4</a>
                    </div>
                    {clipJsonText && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-400">manim_clip JSON</summary>
                        <pre className="mt-1 p-2 bg-black/40 rounded overflow-auto max-h-32">{clipJsonText}</pre>
                      </details>
                    )}
                    <video src={task.outputUrl} controls className="w-full rounded bg-black" onError={() => setVideoError(true)} />
                    {videoError && <p className="text-yellow-400 text-xs">播放失败，请下载查看</p>}
                  </>
                )}
                {task.error && <p className="text-yellow-400 text-xs">{task.error}</p>}
                {task.renderLog && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-400">渲染日志</summary>
                    <pre className="mt-1 p-2 bg-black/40 rounded overflow-auto max-h-40 whitespace-pre-wrap">{task.renderLog}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
