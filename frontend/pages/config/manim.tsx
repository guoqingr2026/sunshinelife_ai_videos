import { useEffect, useMemo, useRef, useState } from "react";
import { api, ManimSceneExample, ManimStatus, Task } from "../../utils/api";
import {
  MANIM_CATEGORIES,
  MANIM_DOMAINS,
  MANIM_TEMPLATES,
  getExampleParams,
  getManimTemplate,
  getTemplateDomain,
  type ManimDomain,
} from "../../utils/manim-catalog";
import FontPresetSelect from "../../components/FontPresetSelect";
import ManimExampleGallery from "../../components/ManimExampleGallery";
import { DEFAULT_FONT_PRESET, getFontPreset } from "../../utils/typography-presets";

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
  const [fontPresetId, setFontPresetId] = useState(DEFAULT_FONT_PRESET.id);
  const [sceneExamples, setSceneExamples] = useState<ManimSceneExample[]>([]);
  const [exampleCategories, setExampleCategories] = useState<Array<{ id: string; label: string }>>([]);
  const skipTypeReset = useRef(false);

  const selected = getManimTemplate(type);

  useEffect(() => {
    api.getManimStatus().then(setStatus).catch(() => {});
    api
      .getManimExamples()
      .then((data) => {
        setSceneExamples(data.examples);
        setExampleCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (skipTypeReset.current) {
      skipTypeReset.current = false;
      return;
    }
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
      const preset = getFontPreset(fontPresetId);
      finalParams.cjk_font = preset.manimFont;
      const result = await api.createManimTask({ type, params: finalParams });
      setTask(await api.getManimTask(result.taskId));
    } finally {
      setLoading(false);
    }
  };

  const fillExample = () => setParamsJson(JSON.stringify(getExampleParams(type), null, 2));

  const applySceneExample = (example: ManimSceneExample) => {
    const json = JSON.stringify(example.params, null, 2);
    if (example.type !== type) {
      skipTypeReset.current = true;
      setType(example.type);
    }
    setParamsJson(json);
  };

  const copyClipUrl = () => task?.outputUrl && navigator.clipboard.writeText(task.outputUrl);
  const copyClipJson = () => task?.clipJson && navigator.clipboard.writeText(JSON.stringify(task.clipJson, null, 2));
  const clipJsonText = task?.clipJson ? JSON.stringify(task.clipJson, null, 2) : "";

  const statusColor = {
    pending: "status-pending",
    running: "status-running",
    success: "status-success",
    failed: "status-failed",
  };

  return (
    <div>
      <h1 className="page-title">Manim 动画引擎</h1>
      <p className="page-desc">
        四域应用：<strong className="text-ink">半导体</strong> · <strong className="text-ink">学习</strong> · <strong className="text-ink">英语</strong> · <strong className="text-ink">媒体/3D</strong>。
        三层能力 L1/L2/L3；覆盖 MathTex（texlive 可选）、ThreeDScene（OpenGL）、SVG/图片/视频。
        生成 <code className="text-primary">.mp4</code> + Remotion <code className="text-primary">manim_clip</code> <code className="text-primary">.json</code>。
      </p>

      {status && (
        <div className={status.manimInstalled ? "alert-ok" : "alert-warn"}>
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

      <div className="mb-4 max-w-md">
        <FontPresetSelect value={fontPresetId} onChange={setFontPresetId} />
      </div>

      <div className="flex flex-wrap gap-2 mb-2 text-xs">
        {(["all", ...MANIM_DOMAINS.map((d) => d.id)] as DomainFilter[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDomainFilter(d)}
            className={domainFilter === d ? "pill-tab pill-tab-active" : "pill-tab"}
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
            className={layerFilter === l ? "pill-tab pill-tab-active" : "pill-tab"}
          >
            {l === "all" ? "全部层" : `L${l}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-2 font-semibold">场景类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field p-2"
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

          {sceneExamples.length > 0 && (
            <ManimExampleGallery
              examples={sceneExamples}
              categories={exampleCategories}
              currentType={type}
              onSelect={applySceneExample}
            />
          )}

          {selected && (
            <div className="panel text-sm space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold">{selected.label}</p>
                  <p className="text-muted text-xs mt-1">{selected.desc}</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className="badge bg-surface text-ink border-border">
                    L{selected.layer}
                  </span>
                  <span className="badge bg-amber-50 text-amber-800 border-amber-200">
                    {MANIM_DOMAINS.find((d) => d.id === getTemplateDomain(selected.id))?.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 font-semibold">Manim 原语（能力索引）</p>
                <div className="flex flex-wrap gap-1">
                  {selected.primitives.map((p) => (
                    <span key={p} className="badge bg-blue-50 text-blue-800 border-blue-200 font-mono">
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
                <ul className="text-xs text-muted space-y-0.5">
                  {Object.entries(selected.paramHelp).map(([k, v]) => (
                    <li key={k}><code className="text-primary">{k}</code> — {v}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-muted font-semibold">参数 JSON</label>
              <button type="button" onClick={fillExample} className="btn-ghost text-xs">
                一键填充示例
              </button>
            </div>
            <textarea
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              rows={type === "custom_python" ? 14 : 10}
              spellCheck={false}
              className="input-field p-3 font-mono text-xs"
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

          <button onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? "渲染中..." : "生成 Manim 视频"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="panel">
            <h3 className="font-bold text-ink mb-3">预览</h3>
            {!task ? (
              <p className="text-muted text-sm">提交后在此预览</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>类型: <code className="text-muted">{String(task.payload?.type ?? type)}</code></p>
                <p>状态: <span className={statusColor[task.status]}>{task.status}</span></p>
                {task.outputUrl && task.status === "success" && (
                  <>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={copyClipUrl} className="btn-ghost text-xs">复制 MP4</button>
                      {task.clipJson && (
                        <button onClick={copyClipJson} className="btn-ghost text-xs">复制 JSON</button>
                      )}
                      <a href={task.outputUrl} download className="btn-ghost text-xs">下载 MP4</a>
                    </div>
                    {clipJsonText && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted font-semibold">manim_clip JSON</summary>
                        <pre className="mt-1 code-block max-h-32">{clipJsonText}</pre>
                      </details>
                    )}
                    <video src={task.outputUrl} controls className="w-full rounded bg-black" onError={() => setVideoError(true)} />
                    {videoError && <p className="text-yellow-400 text-xs">播放失败，请下载查看</p>}
                  </>
                )}
                {task.error && <p className="text-yellow-400 text-xs">{task.error}</p>}
                {task.renderLog && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted font-semibold">渲染日志</summary>
                    <pre className="mt-1 code-block max-h-40 whitespace-pre-wrap">{task.renderLog}</pre>
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
