import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, ComposePayload, ComposeTask } from "../../utils/api";

const EXAMPLE_BRIEF = `PN结原理科普
- 讲解 PN 结如何形成
- 能带结构与载流子运动
- 结合遗忘曲线说明如何高效记忆半导体知识
- 主动回忆与间隔重复`;

const PHASE_LABELS: Record<string, string> = {
  pending: "排队中",
  starting: "启动中",
  planning: "规划中",
  planned: "规划完成",
  manim: "Manim 渲染",
  timeline_ready: "时间轴就绪",
  remotion: "合成成片",
  done: "已完成",
  failed: "失败",
};

function formatElapsed(startedAt?: string): string {
  if (!startedAt) return "—";
  const sec = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  if (sec < 60) return `${sec} 秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} 分 ${s} 秒`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

export default function AutoVideoPage() {
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState(EXAMPLE_BRIEF);
  const [preview, setPreview] = useState(true);
  const [renderFinal, setRenderFinal] = useState(true);
  const [task, setTask] = useState<ComposeTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [tick, setTick] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const isActive = task && task.status !== "success" && task.status !== "failed";

  useEffect(() => {
    if (!isActive) return;
    const poll = setInterval(async () => {
      try {
        setTask(await api.getComposeTask(task!.id));
      } catch {
        /* 轮询失败不打崩页面 */
      }
    }, 1000);
    const clock = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [task?.id, task?.status, isActive]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [task?.payload?.logs?.length]);

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

  const payload = task?.payload as ComposePayload | undefined;
  const percent = payload?.progressPercent ?? (task?.status === "pending" ? 2 : 0);
  const timelineJson = payload?.timeline
    ? JSON.stringify(payload.timeline, null, 2)
    : "";

  const statusColor = {
    pending: "text-yellow-400",
    running: "text-blue-400",
    success: "text-green-400",
    failed: "text-red-400",
  };

  const stepIcon = useMemo(
    () => ({
      pending: "○",
      running: "◉",
      done: "✓",
      skipped: "—",
      error: "✗",
    }),
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">一键自动成片</h1>
      <p className="text-gray-400 text-sm mb-6">
        只需填写<strong className="text-white">视频要求</strong>，系统会自动：规划时间轴 → 渲染 Manim → 填入 JSON → 合成成片。
        镜头规则可在
        <Link to="/config/shot-plan" className="text-primary underline mx-1">
          镜头规划
        </Link>
        页粘贴 GPT 分镜并保存。
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
              disabled={!!isActive}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">视频要求</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={10}
              disabled={!!isActive}
              className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm disabled:opacity-60"
              placeholder="描述你想讲什么，可写关键词或粘贴 GPT 分镜行…"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={preview}
                onChange={(e) => setPreview(e.target.checked)}
                disabled={!!isActive}
              />
              预览模式（更快）
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={renderFinal}
                onChange={(e) => setRenderFinal(e.target.checked)}
                disabled={!!isActive}
              />
              自动合成最终成片
            </label>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !!isActive || !brief.trim()}
            className="px-8 py-3 bg-primary rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "提交中…" : isActive ? "生成进行中…" : renderFinal ? "一键生成完整视频" : "仅生成时间轴 + Manim"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-darker rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">进度</h3>
              {task && (
                <span className="text-xs text-gray-500 font-mono">
                  {task.id.slice(0, 8)}…
                </span>
              )}
            </div>

            {!task ? (
              <p className="text-gray-500 text-sm">提交后开始显示进度</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>
                      状态:{" "}
                      <span className={statusColor[task.status]}>{task.status}</span>
                      {payload?.phase && (
                        <span className="ml-2">
                          · {PHASE_LABELS[payload.phase] || payload.phase}
                        </span>
                      )}
                    </span>
                    <span>已用时 {formatElapsed(payload?.startedAt)}</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        task.status === "failed"
                          ? "bg-red-500"
                          : task.status === "success"
                            ? "bg-green-500"
                            : "bg-primary"
                      }`}
                      style={{ width: `${Math.max(percent, task.status === "pending" ? 2 : 0)}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">{percent}%</p>
                </div>

                {payload?.progress && (
                  <p className="text-blue-300 text-sm leading-relaxed">{payload.progress}</p>
                )}

                {task.status === "pending" && (
                  <p className="text-yellow-500/90 text-xs">
                    等待 Worker 执行（约 2 秒内开始）。若其他 Manim/Remotion 任务正在跑，会依次排队。
                  </p>
                )}

                {payload?.steps && payload.steps.length > 0 && (
                  <ul className="space-y-1.5 text-xs">
                    {payload.steps.map((step) => (
                      <li
                        key={step.id}
                        className={`flex items-center gap-2 ${
                          step.status === "running"
                            ? "text-blue-300"
                            : step.status === "done"
                              ? "text-green-400"
                              : step.status === "error"
                                ? "text-red-400"
                                : step.status === "skipped"
                                  ? "text-gray-600"
                                  : "text-gray-500"
                        }`}
                      >
                        <span className="w-4 text-center">{stepIcon[step.status]}</span>
                        <span>{step.label}</span>
                        {step.id === "manim" && payload.manimTotal && payload.manimTotal > 0 && (
                          <span className="text-gray-500">
                            ({payload.manimCurrent || 0}/{payload.manimTotal})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {payload?.logs && payload.logs.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">实时日志</p>
                    <div className="bg-black/40 rounded p-2 max-h-48 overflow-y-auto font-mono text-xs space-y-0.5">
                      {payload.logs.map((entry, i) => (
                        <div
                          key={i}
                          className={
                            entry.level === "error"
                              ? "text-red-400"
                              : entry.level === "warn"
                                ? "text-yellow-400"
                                : entry.level === "success"
                                  ? "text-green-400"
                                  : "text-gray-400"
                          }
                        >
                          <span className="text-gray-600">[{formatTime(entry.time)}]</span>{" "}
                          {entry.message}
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </div>
                )}

                {task.error && <p className="text-red-400 text-sm">{task.error}</p>}

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
            <details className="bg-darker rounded-lg border border-gray-700 p-4">
              <summary className="font-semibold text-sm cursor-pointer">
                时间轴 JSON（自动更新）
              </summary>
              <pre className="text-xs text-gray-300 overflow-auto max-h-64 whitespace-pre-wrap mt-2">
                {timelineJson}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
