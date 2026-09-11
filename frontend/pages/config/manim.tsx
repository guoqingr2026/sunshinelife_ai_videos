import { useEffect, useState } from "react";
import { api, ManimStatus, Task } from "../../utils/api";

const ANIMATION_TYPES = [
  { id: "pn_junction", label: "PN 结示意图", desc: "N型/P型区域、耗尽层、电流方向" },
  { id: "band_structure", label: "能带结构", desc: "导带、价带、电子空穴运动" },
  { id: "current_arrow", label: "电流箭头", desc: "电阻电路与电流方向" },
  { id: "photon_breakdown", label: "光子击穿", desc: "光子激发电子" },
  { id: "semiconductor_layers", label: "半导体层", desc: "多层半导体结构" },
];

export default function ManimConfig() {
  const [type, setType] = useState("pn_junction");
  const [voltage, setVoltage] = useState(9);
  const [current, setCurrent] = useState(1);
  const [resistance, setResistance] = useState(9);
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<ManimStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    api.getManimStatus().then(setStatus).catch(() => {});
  }, []);

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

  const handleSubmit = async () => {
    setLoading(true);
    setVideoError(false);
    try {
      const result = await api.createManimTask({
        type,
        params: { voltage, current, resistance },
      });
      setTask(await api.getManimTask(result.taskId));
    } finally {
      setLoading(false);
    }
  };

  const copyClipUrl = () => {
    if (!task?.outputUrl) return;
    navigator.clipboard.writeText(task.outputUrl);
  };

  const selected = ANIMATION_TYPES.find((t) => t.id === type);

  const statusColor = {
    pending: "text-yellow-400",
    running: "text-blue-400",
    success: "text-green-400",
    failed: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manim 工程动画</h1>
      <p className="text-gray-400 text-sm mb-4">
        Manim 是 Python 数学/工程动画引擎，用于生成<strong className="text-white"> PN 结、能带、电路</strong>等示意图 MP4。
        生成后复制地址，在 Remotion 时间轴用 <code className="text-primary">manim_clip</code> 插入。
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
            {status.manimInstalled ? "✓ 已安装 Manim — 将生成真实工程动画" : "⚠ 未安装 Manim — 当前为占位视频"}
          </p>
          <p className="text-xs mt-1 opacity-80">{status.hint}</p>
          {!status.manimInstalled && (
            <p className="text-xs mt-1 opacity-80">
              安装命令：<code>py -3 -m pip install manim</code>，或双击运行{" "}
              <code>scripts\install_manim.bat</code>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">动画类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-darker border border-gray-600 rounded-lg p-2"
            >
              {ANIMATION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            {selected && (
              <p className="text-xs text-gray-500 mt-1">{selected.desc}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">电压 (V)</label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">电流 (A)</label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">阻值 (Ω)</label>
              <input
                type="number"
                value={resistance}
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-full bg-darker border border-gray-600 rounded-lg p-2"
              />
            </div>
          </div>

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
                <p>ID: <code className="text-gray-300 break-all">{task.id}</code></p>
                <p>
                  状态: <span className={statusColor[task.status]}>{task.status}</span>
                </p>
                {task.outputUrl && task.status === "success" && (
                  <>
                    <p className="text-xs text-gray-400 break-all">{task.outputUrl}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={copyClipUrl}
                        className="text-primary text-sm underline"
                      >
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
                      <p className="text-yellow-400 text-xs">
                        视频无法播放。若未安装 Manim/ffmpeg，占位文件可能无效；请安装 Manim 后重试。
                      </p>
                    )}
                    {!status?.manimInstalled && (
                      <p className="text-yellow-400 text-xs">
                        当前为占位模式，不是真实 PN 结动画。安装 Manim 后可看到完整示意图。
                      </p>
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
              <div className="space-y-1">
                {status.recentTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => t.outputUrl && navigator.clipboard.writeText(t.outputUrl)}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-800 truncate"
                    title="点击复制地址"
                  >
                    {t.type} — {t.status} — {t.outputUrl || "无输出"}
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
