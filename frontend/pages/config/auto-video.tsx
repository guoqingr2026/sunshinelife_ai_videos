import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ComposeTask } from "../../utils/api";

const EXAMPLE_BRIEF = `PN结原理科普
- 讲解 PN 结如何形成
- 能带结构与载流子运动
- 结合遗忘曲线说明如何高效记忆半导体知识
- 主动回忆与间隔重复`;

export default function AutoVideoPage() {
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState(EXAMPLE_BRIEF);
  const [preview, setPreview] = useState(true);
  const [renderFinal, setRenderFinal] = useState(true);
  const [task, setTask] = useState<ComposeTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!task || task.status === "success" || task.status === "failed") return;
    const timer = setInterval(async () => {
      setTask(await api.getComposeTask(task.id));
    }, 2000);
    return () => clearInterval(timer);
  }, [task]);

  const handleStart = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setVideoError(false);
    try {
      const { taskId } = await api.createComposeTask({
        brief: brief.trim(),
        title: title.trim() || undefined,
        preview,
        renderFinal,
      });
      setTask(await api.getComposeTask(taskId));
    } finally {
      setLoading(false);
    }
  };

  const payload = task?.payload;
  const timelineJson = payload?.timeline
    ? JSON.stringify(payload.timeline, null, 2)
    : "";

  const statusColor = {
    pending: "text-yellow-400",
    running: "text-blue-400",
    success: "text-green-400",
    failed: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">一键自动成片</h1>
      <p className="text-gray-400 text-sm mb-6">
        只需填写<strong className="text-white">视频要求</strong>，系统会自动：规划时间轴 → 渲染 Manim → 填入 JSON → 合成成片。
        镜头规则可在
        <Link to="/config/shot-plan" className="text-primary underline mx-1">
          镜头规划
        </Link>
        页粘贴 GPT 分镜并保存，无需改代码。
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">视频标题（可选）</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="留空则从要求中自动提取"
              className="w-full bg-darker border border-gray-600 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">视频要求</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={10}
              className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm"
              placeholder="描述你想讲什么，可写关键词如：PN结、遗忘曲线、MOSFET、学习技巧…"
            />
            <p className="text-xs text-gray-500 mt-1">
              支持关键词自动匹配 Manim 类型；用「-」开头的行会识别为要点列表。
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={preview}
                onChange={(e) => setPreview(e.target.checked)}
              />
              预览模式（更快）
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={renderFinal}
                onChange={(e) => setRenderFinal(e.target.checked)}
              />
              自动合成最终成片
            </label>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !brief.trim()}
            className="px-8 py-3 bg-primary rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "提交中…" : renderFinal ? "一键生成完整视频" : "仅自动生成时间轴 + Manim"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-darker rounded-lg border border-gray-700 p-4 min-h-[200px]">
            <h3 className="font-semibold mb-3">进度</h3>
            {!task ? (
              <p className="text-gray-500 text-sm">提交后开始显示进度</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  状态:{" "}
                  <span className={statusColor[task.status]}>{task.status}</span>
                </p>
                {payload?.phase && (
                  <p className="text-gray-300">阶段: {payload.phase}</p>
                )}
                {payload?.progress && (
                  <p className="text-blue-300">{payload.progress}</p>
                )}
                {payload?.manimResults && payload.manimResults.length > 0 && (
                  <ul className="text-xs text-gray-400 space-y-1 mt-2">
                    {payload.manimResults.map((m, i) => (
                      <li key={i}>✓ Manim: {m.type}</li>
                    ))}
                  </ul>
                )}
                {task.error && <p className="text-red-400">{task.error}</p>}
                {task.outputUrl && task.status === "success" && (
                  <>
                    <a href={task.outputUrl} download className="text-primary underline text-sm">
                      下载成片
                    </a>
                    <video
                      src={task.outputUrl}
                      controls
                      className="w-full rounded mt-2 bg-black"
                      onError={() => setVideoError(true)}
                    />
                    {videoError && (
                      <p className="text-yellow-400 text-xs">视频播放失败，请尝试下载。</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {timelineJson && (
            <div className="bg-darker rounded-lg border border-gray-700 p-4">
              <h3 className="font-semibold mb-2 text-sm">时间轴 JSON（自动更新）</h3>
              <pre className="text-xs text-gray-300 overflow-auto max-h-80 whitespace-pre-wrap">
                {timelineJson}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
