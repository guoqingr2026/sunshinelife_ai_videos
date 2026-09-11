import { useEffect, useState } from "react";
import { api, Task } from "../../utils/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks(filter || undefined);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const timer = setInterval(loadTasks, 5000);
    return () => clearInterval(timer);
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除此任务？")) return;
    await api.deleteTask(id);
    loadTasks();
  };

  const statusBadge = {
    pending: "bg-yellow-900 text-yellow-300",
    running: "bg-blue-900 text-blue-300",
    success: "bg-green-900 text-green-300",
    failed: "bg-red-900 text-red-300",
  };

  const kindLabel: Record<string, string> = {
    manim: "Manim",
    remotion: "Remotion",
    hyperframes: "HyperFrames",
    compose: "一键成片",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">渲染任务管理</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-darker border border-gray-600 rounded-lg p-2 text-sm"
        >
          <option value="">全部类型</option>
          <option value="manim">Manim</option>
          <option value="remotion">Remotion</option>
          <option value="hyperframes">HyperFrames</option>
          <option value="compose">一键成片</option>
        </select>
      </div>

      {loading && tasks.length === 0 ? (
        <p className="text-gray-500">加载中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">暂无任务</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-darker border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-400">
                    {task.id.slice(0, 12)}...
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800">
                    {kindLabel[task.kind]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${statusBadge[task.status]}`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
                {task.error && (
                  <p className="text-xs text-red-400">{task.error}</p>
                )}
              </div>

              <div className="flex gap-2">
                {task.outputUrl && (
                  <a
                    href={task.outputUrl}
                    download
                    className="px-3 py-1.5 text-sm bg-gray-700 rounded hover:bg-gray-600"
                  >
                    下载视频
                  </a>
                )}
                {task.framesUrl && (
                  <a
                    href={task.framesUrl}
                    className="px-3 py-1.5 text-sm bg-gray-700 rounded hover:bg-gray-600"
                  >
                    查看帧
                  </a>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1.5 text-sm bg-red-900/50 text-red-300 rounded hover:bg-red-900"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
