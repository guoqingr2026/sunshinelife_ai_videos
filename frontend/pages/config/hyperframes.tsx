import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Task } from "../../utils/api";

export default function HyperFramesConfig() {
  const [prompt, setPrompt] = useState(
    "手绘风格的光耦内部结构，LED 发光，箭头表示光子流动"
  );
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(30);
  const [style, setStyle] = useState("handdrawn");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [envStatus, setEnvStatus] = useState<{
    imageApiConfigured: boolean;
    ffmpegAvailable: boolean;
    hints: string[];
    ready: boolean;
    imageModel: string;
  } | null>(null);

  useEffect(() => {
    api.getHyperFramesStatus().then(setEnvStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (!task || task.status === "success" || task.status === "failed") return;
    const timer = setInterval(async () => {
      const updated = await api.getHyperFramesTask(task.id);
      setTask(updated);
    }, 3000);
    return () => clearInterval(timer);
  }, [task]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await api.createHyperFramesTask({
        prompt,
        duration,
        fps,
        style,
      });
      const full = await api.getHyperFramesTask(result.taskId);
      setTask(full);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: "status-pending",
    running: "status-running",
    success: "status-success",
    failed: "status-failed",
  };

  const showVideo = task?.status === "success" && task.outputUrl;
  const showFramesOnly =
    task?.status === "success" && !task.outputUrl && task.framesUrl;

  return (
    <div>
      <h1 className="page-title">HyperFrames 动画配置</h1>

      {envStatus && (
        <div
          className={`panel-muted mb-6 text-sm space-y-2 ${
            envStatus.ready ? "border-green-300" : "border-amber-400"
          }`}
        >
          <p className="font-bold text-ink">
            环境检测：{envStatus.ready ? "就绪" : "未完全就绪"}
          </p>
          <ul className="text-xs text-muted space-y-1 list-disc list-inside">
            <li>
              图像 API：{envStatus.imageApiConfigured ? "已配置" : "未配置（将用占位图）"}
              {envStatus.imageApiConfigured && ` · 模型 ${envStatus.imageModel}`}
            </li>
            <li>ffmpeg：{envStatus.ffmpegAvailable ? "可用" : "未安装（无法合成 MP4）"}</li>
            {envStatus.hints.map((h, i) => (
              <li key={i} className="text-amber-800 font-semibold">{h}</li>
            ))}
          </ul>
          <p className="text-xs text-muted">
            提示词模板见
            <Link to="/config/prompts" className="text-primary underline mx-1">提示词库</Link>
            HyperFrames 步骤。
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-2 font-semibold">动画描述 (Prompt)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="input-field p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1 font-semibold">时长 (秒)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-field p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 font-semibold">FPS</label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="input-field p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 font-semibold">风格</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="input-field p-2"
              >
                <option value="handdrawn">手绘</option>
                <option value="ui">UI</option>
                <option value="engineering">工程</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "提交中..." : "生成帧序列 & 合成视频"}
          </button>
          {envStatus && !envStatus.ready && (
            <p className="text-amber-700 text-xs font-semibold">
              环境未就绪：无 API Key 会得到占位图；无 ffmpeg 无法合成 MP4。建议先修复 .env 后 pm2 restart。
            </p>
          )}
        </div>

        <div className="panel">
          <h3 className="font-bold text-ink mb-3">输出预览</h3>
          {task ? (
            <div className="space-y-2 text-sm">
              <p>ID: <code className="text-muted">{task.id}</code></p>
              <p>
                状态: <span className={statusColor[task.status]}>{task.status}</span>
              </p>
              {task.framesUrl && (
                <p>
                  帧序列:{" "}
                  <a href={task.framesUrl} className="text-primary underline font-semibold">
                    {task.framesUrl}
                  </a>
                </p>
              )}
              {showVideo && (
                <video src={task.outputUrl} controls className="w-full rounded-lg mt-2 border border-border" />
              )}
              {showFramesOnly && (
                <p className="text-amber-700 font-semibold text-xs">
                  任务标记成功但未生成 MP4（通常因 ffmpeg 缺失）。帧目录仍可下载。
                </p>
              )}
              {task.error && (
                <p className={task.status === "failed" ? "text-red-600" : "text-amber-700"}>
                  {task.error}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted">提交任务后显示输出</p>
          )}
        </div>
      </div>
    </div>
  );
}
