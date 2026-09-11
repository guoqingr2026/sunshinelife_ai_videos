import { useEffect, useState } from "react";
import { api, RemotionTemplate, Task } from "../../utils/api";
import {
  BUILTIN_TEMPLATES,
  COLOR_SCHEMES,
  TIMELINE_MODULES,
  ThemeConfig,
} from "../../utils/remotion-presets";

export default function RemotionConfig() {
  const [templateId] = useState("simple-electric");
  const [theme, setTheme] = useState<ThemeConfig>(COLOR_SCHEMES[0]);
  const [timelineJson, setTimelineJson] = useState(
    JSON.stringify(BUILTIN_TEMPLATES[0].timeline, null, 2)
  );
  const [clipUrl, setClipUrl] = useState("");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<RemotionTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    api.getRemotionTemplates().then(setSavedTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    if (!task || task.status === "success" || task.status === "failed") return;
    const timer = setInterval(async () => {
      const updated = await api.getRemotionTask(task.id);
      setTask(updated);
    }, 3000);
    return () => clearInterval(timer);
  }, [task]);

  const insertModule = (mod: (typeof TIMELINE_MODULES)[0]) => {
    const timeline = JSON.parse(timelineJson) as Record<string, unknown>[];
    const item = { ...mod.defaultItem };
    if (mod.type.includes("clip") && clipUrl) {
      item.sourceUrl = clipUrl;
    }
    timeline.push(item);
    setTimelineJson(JSON.stringify(timeline, null, 2));
  };

  const applyBuiltin = (idx: number) => {
    const t = BUILTIN_TEMPLATES[idx];
    setTheme(t.theme);
    setTimelineJson(JSON.stringify(t.timeline, null, 2));
  };

  const loadSaved = (t: RemotionTemplate) => {
    setTheme(t.theme as ThemeConfig);
    setTimelineJson(JSON.stringify(t.timeline, null, 2));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    const timeline = JSON.parse(timelineJson);
    const saved = await api.saveRemotionTemplate({
      name: templateName.trim(),
      templateId,
      timeline,
      theme,
    });
    setSavedTemplates((prev) => [saved, ...prev]);
    setTemplateName("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const timeline = JSON.parse(timelineJson);
      const result = await api.createRemotionTask({
        templateId,
        timeline,
        theme,
        preview,
      });
      setVideoError(false);
      setTask(await api.getRemotionTask(result.taskId));
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: "text-yellow-400",
    running: "text-blue-400",
    success: "text-green-400",
    failed: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Remotion 动画配置</h1>
      <p className="text-gray-400 text-sm mb-4">
        点击模块插入时间轴；配色可一键切换；模板可保存复用。Manim 真实动画请用{" "}
        <code className="text-primary">manim_clip</code> 并填入 MP4 地址。
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">配色方案</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => setTheme(scheme)}
                  className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
                    theme.name === scheme.name
                      ? "border-primary bg-primary/20"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: scheme.primaryColor }}
                  />
                  {scheme.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                title="主色"
                className="h-9 w-full rounded"
              />
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                title="辅色"
                className="h-9 w-full rounded"
              />
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                title="背景"
                className="h-9 w-full rounded"
              />
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                title="强调色"
                className="h-9 w-full rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">插入模块</label>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_MODULES.map((mod) => (
                <button
                  key={mod.type}
                  onClick={() => insertModule(mod)}
                  title={mod.description}
                  className="px-3 py-1.5 bg-darker border border-gray-600 rounded text-sm hover:border-primary"
                >
                  + {mod.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">片段 URL（Manim/HF）</label>
              <input
                value={clipUrl}
                onChange={(e) => setClipUrl(e.target.value)}
                placeholder="/files/manim/xxx.mp4"
                className="w-full bg-darker border border-gray-600 rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">时间轴 JSON</label>
            <textarea
              value={timelineJson}
              onChange={(e) => setTimelineJson(e.target.value)}
              rows={14}
              className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "提交中..." : "提交渲染"}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={preview}
                onChange={(e) => setPreview(e.target.checked)}
              />
              低分辨率预览
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-darker rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold mb-3">内置模板</h3>
            <div className="space-y-2">
              {BUILTIN_TEMPLATES.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => applyBuiltin(i)}
                  className="w-full text-left px-3 py-2 rounded bg-dark hover:bg-gray-800 text-sm"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-darker rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold mb-3">保存的模板</h3>
            <div className="flex gap-2 mb-3">
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="模板名称"
                className="flex-1 bg-dark border border-gray-600 rounded p-2 text-sm"
              />
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="px-3 py-2 bg-gray-700 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
              >
                保存
              </button>
            </div>
            {savedTemplates.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无保存的模板</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedTemplates.map((t) => (
                  <div key={t.id} className="flex gap-2 items-center">
                    <button
                      onClick={() => loadSaved(t)}
                      className="flex-1 text-left px-3 py-2 rounded bg-dark hover:bg-gray-800 text-sm truncate"
                    >
                      {t.name}
                    </button>
                    <button
                      onClick={() =>
                        api.deleteRemotionTemplate(t.id).then(() =>
                          setSavedTemplates((prev) => prev.filter((x) => x.id !== t.id))
                        )
                      }
                      className="text-red-400 text-xs px-2"
                    >
                      删
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-darker rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold mb-3">渲染结果</h3>
            {task ? (
              <div className="space-y-2 text-sm">
                <p>ID: <code className="text-gray-300">{task.id}</code></p>
                <p>
                  状态: <span className={statusColor[task.status]}>{task.status}</span>
                </p>
                {task.outputUrl && task.status === "success" && (
                  <>
                    <a href={task.outputUrl} download className="text-primary underline">
                      下载视频
                    </a>
                    <video
                      key={task.outputUrl}
                      src={task.outputUrl}
                      controls
                      className="w-full rounded mt-2"
                      onError={() => setVideoError(true)}
                    />
                    {videoError && (
                      <p className="text-yellow-400 text-xs">视频无法播放，请检查渲染日志</p>
                    )}
                  </>
                )}
                {task.error && <p className="text-red-400 text-xs">{task.error}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">提交任务后显示结果</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
