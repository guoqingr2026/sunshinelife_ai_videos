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
    pending: "badge-pending",
    running: "badge-running",
    success: "badge-success",
    failed: "badge-failed",
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
        <h1 className="page-title mb-0">渲染任务管理</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field p-2 text-sm w-auto"
        >
          <option value="">全部类型</option>
          <option value="manim">Manim</option>
          <option value="remotion">Remotion</option>
          <option value="hyperframes">HyperFrames</option>
          <option value="compose">一键成片</option>
        </select>
      </div>

      {loading && tasks.length === 0 ? (
        <p className="text-muted">加载中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted">暂无任务</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="panel flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono text-muted">
                    {task.id.slice(0, 12)}...
                  </span>
                  <span className="badge bg-surface text-ink border-border">
                    {kindLabel[task.kind]}
                  </span>
                  <span className={statusBadge[task.status]}>{task.status}</span>
                </div>
                <p className="text-xs text-muted">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
                {task.error && <p className="text-xs text-red-600">{task.error}</p>}
              </div>

              <div className="flex gap-2 flex-wrap">
                {task.outputUrl && (
                  <a href={task.outputUrl} download className="btn-outline text-sm py-1.5">
                    下载视频
                  </a>
                )}
                {task.framesUrl && (
                  <a href={task.framesUrl} className="btn-outline text-sm py-1.5">
                    查看帧
                  </a>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1.5 text-sm rounded-lg font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
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
