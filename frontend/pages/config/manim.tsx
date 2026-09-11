import { useEffect, useMemo, useState } from "react";
import { api, ManimStatus, Task } from "../../utils/api";
import {
  MANIM_CATEGORIES,
  MANIM_TEMPLATES,
  getDefaultParams,
  getManimTemplate,
} from "../../utils/manim-catalog";

export default function ManimConfig() {
  const [type, setType] = useState("pn_junction");
  const [params, setParams] = useState<Record<string, unknown>>(() => getDefaultParams("pn_junction"));
  const [paramsJson, setParamsJson] = useState("");
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<ManimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const selected = getManimTemplate(type);
  const hasParamFields = Boolean(selected?.paramFields?.length);
  const hasComplexParams = Boolean(selected?.defaultParams) && !hasParamFields;

  useEffect(() => {
    api.getManimStatus().then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    const defaults = getDefaultParams(type);
    setParams(defaults);
    setParamsJson(JSON.stringify(defaults, null, 2));
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

  const grouped = useMemo(() => {
    return MANIM_CATEGORIES.map((cat) => ({
      ...cat,
      items: MANIM_TEMPLATES.filter((t) => t.category === cat.id),
    })).filter((g) => g.items.length > 0);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setVideoError(false);
    try {
      let finalParams = params;
      if (hasComplexParams) {
        try {
          finalParams = JSON.parse(paramsJson);
        } catch {
          alert("参数 JSON 格式错误");
          setLoading(false);
          return;
        }
      }
      const result = await api.createManimTask({ type, params: finalParams });
      setTask(await api.getManimTask(result.taskId));
    } finally {
      setLoading(false);
    }
  };

  const copyClipUrl = () => {
    if (!task?.outputUrl) return;
    navigator.clipboard.writeText(task.outputUrl);
  };

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
        支持 <strong className="text-white">工程示意、数学图表、信息图、文本动画、结构轨道</strong> 等 {MANIM_TEMPLATES.length} 种场景。
        生成后复制地址，在 Remotion 时间轴用 <code className="text-primary">manim_clip</code> 插入，组合成完整视频。
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
            {status.manimInstalled ? "✓ 已安装 Manim — 将生成真实动画" : "⚠ 未安装 Manim — 当前为占位视频"}
          </p>
          <p className="text-xs mt-1 opacity-80">{status.hint}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">动画类型（{MANIM_TEMPLATES.length} 种）</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-darker border border-gray-600 rounded-lg p-2"
            >
              {grouped.map((g) => (
                <optgroup key={g.id} label={g.label}>
                  {g.items.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selected && (
              <p className="text-xs text-gray-500 mt-1">{selected.desc}</p>
            )}
          </div>

          {hasParamFields && selected?.paramFields && (
            <div className="grid grid-cols-1 gap-3">
              {selected.paramFields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(params[f.key] ?? "")}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="w-full bg-darker border border-gray-600 rounded-lg p-2"
                  />
                </div>
              ))}
            </div>
          )}

          {hasComplexParams && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">参数 JSON（数组/对象）</label>
              <textarea
                value={paramsJson}
                onChange={(e) => setParamsJson(e.target.value)}
                rows={6}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2 font-mono text-xs"
              />
            </div>
          )}

          {!hasParamFields && !hasComplexParams && type === "current_arrow" && (
            <div className="grid grid-cols-3 gap-3">
              {(["voltage", "current", "resistance"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1">
                    {key === "voltage" ? "电压 (V)" : key === "current" ? "电流 (A)" : "阻值 (Ω)"}
                  </label>
                  <input
                    type="number"
                    value={Number(params[key] ?? 0)}
                    onChange={(e) => setParams({ ...params, [key]: Number(e.target.value) })}
                    className="w-full bg-darker border border-gray-600 rounded-lg p-2"
                  />
                </div>
              ))}
            </div>
          )}

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
            {task ? (
              <div className="space-y-2 text-sm">
                <p>类型: <code className="text-gray-300">{task.type}</code></p>
                <p>ID: <code className="text-gray-300 break-all">{task.id}</code></p>
                <p>
                  状态: <span className={statusColor[task.status]}>{task.status}</span>
                </p>
                {task.outputUrl && task.status === "success" && (
                  <>
                    <p className="text-xs text-gray-400 break-all">{task.outputUrl}</p>
                    <div className="flex gap-2">
                      <button onClick={copyClipUrl} className="text-primary text-sm underline">
                        复制片段地址（用于 Remotion）
                      </button>
                      <a href={task.outputUrl} download className="text-sm text-gray-400 underline">
                        下载
                      </a>
                    </div>
                    <video
                      src={task.outputUrl}
                      controls
                      className="w-full rounded mt-2 bg-black"
                      onError={() => setVideoError(true)}
                    />
                    {videoError && (
                      <p className="text-yellow-400 text-xs">视频无法播放，请检查 Manim/ffmpeg 安装。</p>
                    )}
                  </>
                )}
                {task.error && (
                  <p className={task.status === "success" ? "text-yellow-400 text-xs" : "text-red-400"}>
                    {task.error}
                  </p>
                )}
                {task.renderLog && (
                  <details className="text-xs text-gray-500 mt-2">
                    <summary className="cursor-pointer text-gray-400">渲染日志</summary>
                    <pre className="mt-1 p-2 bg-black/40 rounded overflow-x-auto max-h-40 whitespace-pre-wrap">
                      {task.renderLog}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <p className="text-gray-500">提交后在此预览</p>
            )}
          </div>

          {status?.recentTasks && status.recentTasks.length > 0 && (
            <div className="bg-darker rounded-lg border border-gray-700 p-4">
              <h3 className="font-semibold mb-2 text-sm">最近任务</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {status.recentTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => t.outputUrl && navigator.clipboard.writeText(t.outputUrl)}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-800 truncate"
                    title="点击复制地址"
                  >
                    {t.type} — {t.status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
