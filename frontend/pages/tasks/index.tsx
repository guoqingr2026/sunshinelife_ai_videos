import { useCallback, useEffect, useRef, useState } from "react";
import { api, ComposePayload, Task } from "../../utils/api";
import {
  archiveAndMaybePurge,
  archiveTaskToLocal,
  buildProjectFolderName,
  loadSavedDirHandle,
  pickArchiveDirectory,
} from "../../utils/local-archive";
import {
  DEFAULT_ARCHIVE_SETTINGS,
  loadArchiveSettings,
  saveArchiveSettings,
  type LocalArchiveSettings,
} from "../../utils/local-archive-settings";

function taskTitle(task: Task): string {
  const p = task.payload as ComposePayload & Record<string, unknown>;
  return (
    (typeof p.title === "string" && p.title) ||
    (p.project && typeof p.project.title === "string" && p.project.title) ||
    buildProjectFolderName(task)
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<LocalArchiveSettings>(DEFAULT_ARCHIVE_SETTINGS);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const archivedIds = useRef<Set<string>>(new Set());

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTasks(filter || undefined);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const s = loadArchiveSettings();
    loadSavedDirHandle().then((h) => {
      if (h) s.folderName = h.name;
      setSettings(s);
    });
  }, []);

  useEffect(() => {
    loadTasks();
    const timer = setInterval(loadTasks, 5000);
    return () => clearInterval(timer);
  }, [loadTasks]);

  const persistSettings = (next: LocalArchiveSettings) => {
    setSettings(next);
    saveArchiveSettings(next);
  };

  const handlePickFolder = async () => {
    const handle = await pickArchiveDirectory();
    if (handle) {
      persistSettings({ ...settings, folderName: handle.name });
      setMessage(`已选择本地目录：${handle.name}`);
    }
  };

  const runArchive = async (task: Task, usePurge: boolean) => {
    if (task.status !== "success") {
      alert("仅可归档已成功的任务");
      return;
    }
    setArchivingId(task.id);
    setMessage("");
    try {
      const result = usePurge
        ? await archiveAndMaybePurge(task)
        : await archiveTaskToLocal(task);
      archivedIds.current.add(task.id);
      setMessage(
        `已归档到「${result.folderName}」（${result.mode === "filesystem" ? "写入文件夹" : "浏览器下载"}）` +
          (usePurge && settings.deleteRemoteAfterArchive ? "，ECS 文件已清理" : "")
      );
      if (settings.remindBaiduBackup) {
        setMessage((m) => m + "。可在 Cursor 中说「备份到百度云」触发 learnv-baidu-backup 技能。");
      }
      loadTasks();
    } catch (e) {
      alert(String(e));
    } finally {
      setArchivingId(null);
    }
  };

  useEffect(() => {
    if (!settings.autoArchiveOnSuccess || !settings.folderName) return;
    for (const task of tasks) {
      if (task.status !== "success" || archivedIds.current.has(task.id)) continue;
      if (task.kind !== "compose" && !task.outputUrl) continue;
      archivedIds.current.add(task.id);
      runArchive(task, settings.deleteRemoteAfterArchive).catch(() => {
        archivedIds.current.delete(task.id);
      });
    }
  }, [tasks, settings.autoArchiveOnSuccess, settings.folderName, settings.deleteRemoteAfterArchive]);

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除此任务及 ECS 上的所有文件？")) return;
    await api.deleteTask(id);
    loadTasks();
  };

  const handlePurgeOnly = async (id: string) => {
    if (!confirm("仅删除 ECS 磁盘文件，保留任务记录？")) return;
    await api.purgeTaskAssets(id);
    setMessage("ECS 文件已清理");
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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
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

      <div className="panel mb-6 space-y-3 text-sm">
        <p className="font-semibold text-ink">本地归档（ECS 只生产，成品存你电脑）</p>
        <p className="text-xs text-muted">
          ECS 负责渲染；成片与工程 ZIP 归档到你选的文件夹，按工程名自动命名（标题_日期_任务ID）。
          归档后可自动清理 ECS 磁盘。百度云备份见 Cursor 技能 <code>learnv-baidu-backup</code> 或{" "}
          <code>scripts/sync-ecs-to-local.ps1</code>。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handlePickFolder} className="btn-outline text-xs">
            选择本地文件夹
          </button>
          <span className="text-xs text-muted">
            {settings.folderName ? `当前：${settings.folderName}` : "未选择（将回退为浏览器下载）"}
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={settings.autoArchiveOnSuccess}
            onChange={(e) =>
              persistSettings({ ...settings, autoArchiveOnSuccess: e.target.checked })
            }
          />
          新任务成功后自动归档
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={settings.deleteRemoteAfterArchive}
            onChange={(e) =>
              persistSettings({ ...settings, deleteRemoteAfterArchive: e.target.checked })
            }
          />
          归档后自动清理 ECS 文件（释放服务器空间）
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={settings.remindBaiduBackup}
            onChange={(e) =>
              persistSettings({ ...settings, remindBaiduBackup: e.target.checked })
            }
          />
          归档后提示百度云备份
        </label>
        {message && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">{message}</p>}
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
                  <span className="text-sm font-medium text-ink">{taskTitle(task)}</span>
                  <span className="badge bg-surface text-ink border-border">
                    {kindLabel[task.kind]}
                  </span>
                  <span className={statusBadge[task.status]}>{task.status}</span>
                </div>
                <p className="text-xs text-muted font-mono">
                  {task.id.slice(0, 12)}… · {new Date(task.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-muted">归档名：{buildProjectFolderName(task)}</p>
                {task.error && <p className="text-xs text-red-600">{task.error}</p>}
              </div>

              <div className="flex gap-2 flex-wrap">
                {task.kind === "compose" && task.status === "success" && (
                  <a
                    href={api.getComposeBundleUrl(task.id)}
                    download
                    className="btn-outline text-sm py-1.5"
                  >
                    工程 ZIP
                  </a>
                )}
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
                {task.status === "success" && (
                  <button
                    type="button"
                    disabled={archivingId === task.id}
                    onClick={() => runArchive(task, settings.deleteRemoteAfterArchive)}
                    className="btn-primary text-sm py-1.5"
                  >
                    {archivingId === task.id ? "归档中…" : "归档到本地"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePurgeOnly(task.id)}
                  className="btn-ghost text-xs"
                >
                  仅清 ECS
                </button>
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
