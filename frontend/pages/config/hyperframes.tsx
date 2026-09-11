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
    pending: "text-yellow-400",
    running: "text-blue-400",
    success: "text-green-400",
    failed: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">HyperFrames 动画配置</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">动画描述 (Prompt)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">时长 (秒)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">FPS</label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">风格</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2"
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
            className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "提交中..." : "生成帧序列 & 合成视频"}
          </button>
        </div>

        <div className="bg-darker rounded-lg border border-gray-700 p-4">
          <h3 className="font-semibold mb-3">输出预览</h3>
          {task ? (
            <div className="space-y-2 text-sm">
              <p>ID: <code className="text-gray-300">{task.id}</code></p>
              <p>
                状态:{" "}
                <span className={statusColor[task.status]}>{task.status}</span>
              </p>
              {task.framesUrl && (
                <p>
                  帧序列:{" "}
                  <a href={task.framesUrl} className="text-primary underline">
                    {task.framesUrl}
                  </a>
                </p>
              )}
              {task.outputUrl && task.status === "success" && (
                <video
                  src={task.outputUrl}
                  controls
                  className="w-full rounded mt-2"
                />
              )}
              {task.error && <p className="text-red-400">{task.error}</p>}
            </div>
          ) : (
            <p className="text-gray-500">提交任务后显示输出</p>
          )}
        </div>
      </div>
    </div>
  );
}
