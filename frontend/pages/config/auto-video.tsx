import { useEffect, useMemo, useRef, useState } from "react";
import { api, ComposePayload, ComposeTask } from "../../utils/api";
import { MVP_PROJECT_JSON, MVP_WORKFLOW_HELP } from "../../utils/mvp-project";
import {
  MATH_EXPONENTIAL_PROJECT_JSON,
  MATH_EXPONENTIAL_PROJECT_LITE_JSON,
} from "../../utils/example-math-project";
import { MANIM_TEMPLATES } from "../../utils/manim-catalog";
import FontPresetSelect from "../../components/FontPresetSelect";
import { COLOR_SCHEMES } from "../../utils/remotion-presets";
import { DEFAULT_FONT_PRESET, applyFontPresetToTheme } from "../../utils/typography-presets";

const REMOTION_SHOT_TYPES = new Set([
  "title", "chapter", "bullet_list", "fade_text", "subtitle", "quote",
  "flow_steps", "timeline_bar", "formula_card", "compare", "arrow", "stat", "params",
]);
const MANIM_IDS = new Set(MANIM_TEMPLATES.map((t) => t.id));

function analyzeShots(shots: Array<{ type: string }> | undefined) {
  if (!shots?.length) return { manim: 0, remotion: 0, unknown: [] as string[] };
  let manim = 0;
  let remotion = 0;
  const unknown: string[] = [];
  for (const s of shots) {
    if (MANIM_IDS.has(s.type)) manim++;
    else if (REMOTION_SHOT_TYPES.has(s.type)) remotion++;
    else unknown.push(s.type);
  }
  return { manim, remotion, unknown };
}

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
  const [submitError, setSubmitError] = useState("");
  const [fontPresetId, setFontPresetId] = useState(DEFAULT_FONT_PRESET.id);
  const [videoError, setVideoError] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const project = useMemo(() => parseProjectJson(projectJson), [projectJson]);
  const jsonValid = project !== null && (project.shots?.length ?? 0) > 0;
  const shotStats = useMemo(() => analyzeShots(project?.shots), [project?.shots]);

  const isActive = task && task.status !== "success" && task.status !== "failed";

  const resetLocalTask = () => {
    setTask(null);
    setSubmitError("");
    setVideoError(false);
  };

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
    setSubmitError("");
    setTask(null);
    try {
      const theme = applyFontPresetToTheme(COLOR_SCHEMES[3], fontPresetId);
      const { taskId } = await api.createComposeTask({
        brief: "",
        title: project.title,
        project,
        preview,
        renderFinal,
        theme,
      });
      setTask(await api.getComposeTask(taskId));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSubmitError(
        `提交失败：${msg}。请确认 API 已启动（pm2 logs sunshinelife-videos-api），且 ECS 已 git pull + pnpm --filter frontend build。`
      );
      console.error("compose start failed", e);
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
    pending: "status-pending",
    running: "status-running",
    success: "status-success",
    failed: "status-failed",
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
      <h1 className="page-title">一键成片（MVP）</h1>
      <p className="page-desc">
        只需填写下方<strong className="text-ink">项目 JSON</strong>，系统按固定流程执行：
        规划时间轴 → 渲染 Manim → 写入 timeline → Remotion 合成 → 自动导出 <code className="text-primary">output</code> 工程包（可下载到本地）。
      </p>

      <div className="panel-muted mb-6 text-sm font-mono leading-relaxed">
        <pre className="whitespace-pre-wrap text-xs text-muted">{MVP_WORKFLOW_HELP.trim()}</pre>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-muted font-semibold">项目 JSON（唯一分镜来源）</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    resetLocalTask();
                    setProjectJson(MVP_PROJECT_JSON);
                    setPreviewPlan(null);
                    setPlanError("");
                  }}
                  className="btn-ghost text-xs"
                >
                  学习 MVP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetLocalTask();
                    setProjectJson(MATH_EXPONENTIAL_PROJECT_LITE_JSON);
                    setPreviewPlan(null);
                    setPlanError("");
                  }}
                  className="pill-tab text-xs py-1"
                >
                  数学题·快速版
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetLocalTask();
                    setProjectJson(MATH_EXPONENTIAL_PROJECT_JSON);
                    setPreviewPlan(null);
                    setPlanError("");
                  }}
                  className="pill-tab text-xs py-1"
                >
                  数学题·完整版
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
              className={`input-field p-3 text-xs font-mono disabled:opacity-60 ${
                jsonValid ? "" : "border-red-400"
              }`}
              spellCheck={false}
            />
            {!jsonValid && projectJson.trim() && (
              <p className="text-red-400 text-xs mt-1">JSON 格式错误或 shots 为空</p>
            )}
            {jsonValid && project && (
              <div className="text-xs mt-1 space-y-0.5">
                <p className="text-success font-semibold">
                  已识别 {project.shots!.length} 个镜头（Manim {shotStats.manim} · Remotion {shotStats.remotion})
                  {project.title ? ` · 「${project.title}」` : ""}
                </p>
                {shotStats.manim > 8 && (
                  <p className="text-amber-700 font-semibold">
                    含 {shotStats.manim} 个 Manim，全片约 20–40 分钟；建议先用「快速版」或取消「自动合成成片」。
                  </p>
                )}
                {shotStats.unknown.length > 0 && (
                  <p className="text-red-400">
                    未知镜头类型：{shotStats.unknown.join(", ")} — 请 git pull 更新 ECS 后重试。
                  </p>
                )}
              </div>
            )}
            {isActive && (
              <p className="text-amber-700 font-semibold text-xs mt-1">
                有任务进行中。可先点「重置界面状态」再换示例；或等待当前任务结束。
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePreviewPlan}
              disabled={planning || !!isActive || !jsonValid}
              className="btn-outline disabled:opacity-50"
            >
              {planning ? "预览中…" : "预览分镜"}
            </button>
            <button
              onClick={handleStart}
              disabled={loading || !!isActive || !jsonValid || shotStats.unknown.length > 0}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "提交中…" : isActive ? "生成进行中…" : "一键生成视频"}
            </button>
            {(isActive || task) && (
              <button type="button" onClick={resetLocalTask} className="btn-outline">
                重置界面状态
              </button>
            )}
          </div>

          <FontPresetSelect
            value={fontPresetId}
            onChange={setFontPresetId}
            disabled={!!isActive}
            className="max-w-md"
          />

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-muted font-semibold">
              <input
                type="checkbox"
                checked={preview}
                onChange={(e) => setPreview(e.target.checked)}
                disabled={!!isActive}
              />
              预览模式（更快）
            </label>
            <label className="flex items-center gap-2 text-muted font-semibold">
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
          {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

          {previewPlan && (
            <div className="panel text-sm space-y-2">
              <p className="font-bold text-ink">分镜预览 · {previewPlan.title}</p>
              <ul className="text-xs space-y-1 text-ink">
                {(previewPlan.resolvedShots || []).map((s, i) => (
                  <li key={i}>
                    <span className="text-muted">{i + 1}.</span>{" "}
                    <span className={s.kind === "manim" ? "text-success font-semibold" : "text-primary font-semibold"}>
                      [{s.kind}]
                    </span>{" "}
                    {s.type} — {s.label}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">
                Manim 任务 {previewPlan.manimJobs.length} 个 · 时间轴共 {previewPlan.timeline.length} 段
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="panel">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-ink">进度</h3>
              {task && (
                <span className="text-xs text-muted font-mono">
                  {task.id.slice(0, 8)}…
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-primary font-semibold text-sm">正在提交任务…</p>
            ) : !task ? (
              <p className="text-muted text-sm">点击「一键生成视频」后开始</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between text-xs text-muted mb-1 font-semibold">
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
                  <div className="h-3 bg-surface border border-border rounded-full overflow-hidden">
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
                  <p className="text-right text-xs text-muted mt-1 font-semibold">{percent}%</p>
                </div>

                {payload?.progress && (
                  <p className="text-primary text-sm leading-relaxed font-semibold">{payload.progress}</p>
                )}

                {task.status === "pending" && (
                  <p className="text-amber-700 font-semibold text-xs">
                    等待 Worker 执行。若其他 Manim/Remotion 任务正在跑，会依次排队。
                  </p>
                )}

                {payload?.steps && payload.steps.length > 0 && (
                  <ul className="space-y-1.5 text-xs">
                    {payload.steps.map((step) => (
                      <li
                        key={step.id}
                        className={`flex items-center gap-2 font-semibold ${
                          step.status === "running"
                            ? "text-primary"
                            : step.status === "done"
                              ? "text-success"
                              : step.status === "error"
                                ? "text-red-600"
                                : step.status === "skipped"
                                  ? "text-muted"
                                  : "text-muted"
                        }`}
                      >
                        <span className="w-4 text-center">{stepIcon[step.status]}</span>
                        <span>{step.label}</span>
                        {step.id === "manim" && payload.manimTotal && payload.manimTotal > 0 && (
                          <span className="text-muted">
                            ({payload.manimCurrent || 0}/{payload.manimTotal})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {payload?.logs && payload.logs.length > 0 && (
                  <div>
                    <p className="text-xs text-muted mb-1 font-semibold">实时日志</p>
                    <div className="code-block max-h-48 space-y-0.5">
                      {payload.logs.map((entry, i) => (
                        <div
                          key={i}
                          className={
                            entry.level === "error"
                              ? "text-red-600"
                              : entry.level === "warn"
                                ? "text-amber-700"
                                : entry.level === "success"
                                  ? "text-success"
                                  : "text-muted"
                          }
                        >
                          <span className="text-muted/70">[{formatTime(entry.time)}]</span>{" "}
                          {entry.message}
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </div>
                )}

                {task.error && <p className="text-red-600 text-sm font-semibold">{task.error}</p>}

                {task.status === "success" && (task.outputUrl || payload?.bundleZipUrl) && (
                  <>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {task.outputUrl && (
                        <a href={task.outputUrl} download className="btn-ghost">
                          下载成片 MP4
                        </a>
                      )}
                      {payload?.bundleZipUrl && (
                        <a
                          href={api.getComposeBundleUrl(task.id)}
                          download
                          className="btn-ghost text-success"
                        >
                          下载 output 工程包 (.zip)
                        </a>
                      )}
                      {payload?.bundleDirUrl && (
                        <a
                          href={payload.bundleDirUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs"
                        >
                          浏览服务器 output 目录
                        </a>
                      )}
                    </div>
                    {payload?.bundleZipUrl && (
                      <p className="text-xs text-muted mt-1">
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
            <details className="panel">
              <summary className="font-bold text-sm cursor-pointer text-ink">
                Remotion 时间轴 JSON（合成用）
              </summary>
              <pre className="text-xs text-ink code-block max-h-64 whitespace-pre-wrap mt-2">
                {timelineJson}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
