import { useEffect, useState } from "react";
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

  return (
    <div>
      <h1 className="page-title">HyperFrames 动画配置</h1>

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

          <button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="btn-primary">
            {loading ? "提交中..." : "生成帧序列 & 合成视频"}
          </button>
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
              {task.outputUrl && task.status === "success" && (
                <video src={task.outputUrl} controls className="w-full rounded-lg mt-2 border border-border" />
              )}
              {task.error && <p className="text-red-600">{task.error}</p>}
            </div>
          ) : (
            <p className="text-muted">提交任务后显示输出</p>
          )}
        </div>
      </div>
    </div>
  );
}
