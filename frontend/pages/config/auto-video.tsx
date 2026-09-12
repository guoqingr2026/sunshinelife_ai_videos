import { useEffect, useMemo, useRef, useState } from "react";
import { api, ComposePayload, ComposeTask } from "../../utils/api";
import { MVP_PROJECT_JSON, MVP_WORKFLOW_HELP } from "../../utils/mvp-project";
import { MATH_EXPONENTIAL_PROJECT_JSON } from "../../utils/example-math-project";

const PHASE_LABELS: Record<string, string> = {
  pending: "排队中",
  starting: "启动中",
  planning: "规划中",
  planned: "规划完成",
  manim: "Manim 渲染",
  timeline_ready: "时间轴就绪",
  remotion: "合成成片",
  bundle: "导出工程包",
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

function parseProjectJson(text: string): { title?: string; shots?: Array<{ type: string; label: string; params?: Record<string, unknown> }> } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (!obj || typeof obj !== "object") return null;
    return obj;
  } catch {
    return null;
  }
}

export default function AutoVideoPage() {
  const [projectJson, setProjectJson] = useState(MVP_PROJECT_JSON);
  const [previewPlan, setPreviewPlan] = useState<{
    title: string;
    resolvedShots?: Array<{ kind: string; type: string; label: string }>;
    manimJobs: unknown[];
    timeline: unknown[];
  } | null>(null);
  const [planError, setPlanError] = useState("");
  const [preview, setPreview] = useState(true);
  const [renderFinal, setRenderFinal] = useState(true);
  const [task, setTask] = useState<ComposeTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const project = useMemo(() => parseProjectJson(projectJson), [projectJson]);
  const jsonValid = project !== null && (project.shots?.length ?? 0) > 0;

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
    return () => clearInterval(poll);
  }, [task?.id, task?.status, isActive]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [task?.payload?.logs?.length]);

  const handlePreviewPlan = async () => {
    if (!project?.shots?.length) {
      setPlanError("项目 JSON 无效或 shots 为空");
      return;
    }
    setPlanning(true);
    setPlanError("");
    try {
      const plan = await api.planVideo({
        brief: "",
        title: project.title,
        project,
      });
      setPreviewPlan(plan);
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : String(e));
      setPreviewPlan(null);
    } finally {
      setPlanning(false);
    }
  };

  const handleStart = async () => {
    if (!project?.shots?.length) return;
    setLoading(true);
    setVideoError(false);
    try {
      const { taskId } = await api.createComposeTask({
        brief: "",
        title: project.title,
        project,
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
      <h1 className="text-2xl font-bold mb-2">一键成片（MVP）</h1>
      <p className="text-gray-400 text-sm mb-4">
        只需填写下方<strong className="text-white">项目 JSON</strong>，系统按固定流程执行：
        规划时间轴 → 渲染 Manim → 写入 timeline → Remotion 合成 → 自动导出 <code className="text-primary">output</code> 工程包（可下载到本地）。
      </p>

      <div className="bg-darker border border-gray-700 rounded-lg p-4 mb-6 text-sm text-gray-300 font-mono leading-relaxed">
        <pre className="whitespace-pre-wrap text-xs text-gray-400">{MVP_WORKFLOW_HELP.trim()}</pre>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-400">项目 JSON（唯一分镜来源）</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProjectJson(MVP_PROJECT_JSON)}
                  disabled={!!isActive}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  学习 MVP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectJson(MATH_EXPONENTIAL_PROJECT_JSON);
                    setPreviewPlan(null);
                    setPlanError("");
                  }}
                  disabled={!!isActive}
                  className="text-xs text-green-400 hover:underline disabled:opacity-50"
                >
                  数学题示例 2^t=t^32
                </button>
              </div>
            </div>
            <textarea
              value={projectJson}
              onChange={(e) => {
                setProjectJson(e.target.value);
                setPreviewPlan(null);
                setPlanError("");
              }}
              rows={16}
              disabled={!!isActive}
              className={`w-full bg-darker border rounded-lg p-3 text-xs font-mono disabled:opacity-60 ${
                jsonValid ? "border-gray-600" : "border-red-500/60"
              }`}
              spellCheck={false}
            />
            {!jsonValid && projectJson.trim() && (
              <p className="text-red-400 text-xs mt-1">JSON 格式错误或 shots 为空</p>
            )}
            {jsonValid && project && (
              <p className="text-green-500/80 text-xs mt-1">
                已识别 {project.shots!.length} 个镜头
                {project.title ? ` · 标题「${project.title}」` : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePreviewPlan}
              disabled={planning || !!isActive || !jsonValid}
              className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {planning ? "预览中…" : "预览分镜"}
            </button>
            <button
              onClick={handleStart}
              disabled={loading || !!isActive || !jsonValid}
              className="px-6 py-2 bg-primary rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "提交中…" : isActive ? "生成进行中…" : "一键生成视频"}
            </button>
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

          {planError && <p className="text-red-400 text-sm">{planError}</p>}

          {previewPlan && (
            <div className="bg-darker border border-gray-700 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold">分镜预览 · {previewPlan.title}</p>
              <ul className="text-xs space-y-1 text-gray-300">
                {(previewPlan.resolvedShots || []).map((s, i) => (
                  <li key={i}>
                    <span className="text-gray-500">{i + 1}.</span>{" "}
                    <span className={s.kind === "manim" ? "text-green-400" : "text-blue-400"}>
                      [{s.kind}]
                    </span>{" "}
                    {s.type} — {s.label}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500">
                Manim 任务 {previewPlan.manimJobs.length} 个 · 时间轴共 {previewPlan.timeline.length} 段
              </p>
            </div>
          )}
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
              <p className="text-gray-500 text-sm">点击「一键生成视频」后开始</p>
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
                    等待 Worker 执行。若其他 Manim/Remotion 任务正在跑，会依次排队。
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

                {task.status === "success" && (task.outputUrl || payload?.bundleZipUrl) && (
                  <>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {task.outputUrl && (
                        <a href={task.outputUrl} download className="text-primary underline">
                          下载成片 MP4
                        </a>
                      )}
                      {payload?.bundleZipUrl && (
                        <a
                          href={api.getComposeBundleUrl(task.id)}
                          download
                          className="text-green-400 underline font-medium"
                        >
                          下载 output 工程包 (.zip)
                        </a>
                      )}
                      {payload?.bundleDirUrl && (
                        <a
                          href={payload.bundleDirUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 underline text-xs"
                        >
                          浏览服务器 output 目录
                        </a>
                      )}
                    </div>
                    {payload?.bundleZipUrl && (
                      <p className="text-xs text-gray-500 mt-1">
                        工程包含：project.json、timeline、Manim 素材、成片、README 与制作日志，解压后可在本地二次开发。
                      </p>
                    )}
                  </>
                )}

                {task.outputUrl && task.status === "success" && (
                  <>
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
                Remotion 时间轴 JSON（合成用）
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
