import { api, ComposePayload, Task } from "./api";
import { loadArchiveSettings } from "./local-archive-settings";

const IDB_NAME = "learnv-archive";
const IDB_STORE = "handles";
const IDB_KEY = "projectDir";

let cachedDirHandle: FileSystemDirectoryHandle | null = null;

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadSavedDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (cachedDirHandle) return cachedDirHandle;
  if (!("indexedDB" in window)) return null;
  try {
    const db = await openIdb();
    const handle = await new Promise<FileSystemDirectoryHandle | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) || null);
      req.onerror = () => resolve(null);
    });
    db.close();
    if (handle) {
      const perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm === "granted") {
        cachedDirHandle = handle;
        return handle;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function pickArchiveDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!("showDirectoryPicker" in window)) {
    alert("当前浏览器不支持选择文件夹。请使用 Chrome/Edge，或运行 scripts/sync-ecs-to-local.ps1");
    return null;
  }
  const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  cachedDirHandle = handle;
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return handle;
}

export function buildProjectFolderName(task: Task): string {
  const payload = task.payload as ComposePayload & Record<string, unknown>;
  const title =
    (typeof payload.title === "string" && payload.title) ||
    (payload.project && typeof payload.project.title === "string" && payload.project.title) ||
    (typeof payload.type === "string" && payload.type) ||
    task.kind;
  const date = new Date(task.createdAt).toISOString().slice(0, 10);
  const slug = String(title)
    .replace(/[^\w\u4e00-\u9fff-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 48);
  return `${slug || task.kind}_${date}_${task.id.slice(0, 8)}`;
}

async function writeBlobToDir(
  root: FileSystemDirectoryHandle,
  relativePath: string,
  blob: Blob
) {
  const parts = relativePath.split("/").filter(Boolean);
  let dir = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: true });
  }
  const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`);
  return res.blob();
}

function resolveAssetUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base = import.meta.env.VITE_API_BASE || "";
  const prefix = base.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${prefix}${path}`;
}

export interface ArchiveResult {
  folderName: string;
  files: string[];
  mode: "filesystem" | "download";
}

/** 将任务产物写入本地目录；无目录权限时回退为浏览器下载 */
export async function archiveTaskToLocal(
  task: Task,
  dirHandle?: FileSystemDirectoryHandle | null
): Promise<ArchiveResult> {
  const folderName = buildProjectFolderName(task);
  const handle = dirHandle ?? (await loadSavedDirHandle());
  const files: string[] = [];

  const downloads: Array<{ name: string; url: string }> = [];

  if (task.kind === "compose" && task.status === "success") {
    downloads.push({
      name: `${folderName}/project-bundle.zip`,
      url: api.getComposeBundleUrl(task.id),
    });
  }
  if (task.outputUrl) {
    const ext = task.outputUrl.includes(".mp4") ? "mp4" : "bin";
    downloads.push({
      name: `${folderName}/final.${ext}`,
      url: resolveAssetUrl(task.outputUrl),
    });
  }

  if (downloads.length === 0) {
    throw new Error("该任务没有可归档的文件（可能尚未完成或仅有中间产物）");
  }

  if (handle) {
    let projectDir = handle;
    try {
      projectDir = await handle.getDirectoryHandle(folderName, { create: true });
    } catch {
      projectDir = handle;
    }
    for (const item of downloads) {
      const blob = await fetchBlob(item.url);
      const rel = item.name.includes("/") ? item.name.split("/").slice(1).join("/") : item.name;
      await writeBlobToDir(projectDir, rel, blob);
      files.push(item.name);
    }
    return { folderName, files, mode: "filesystem" };
  }

  for (const item of downloads) {
    const blob = await fetchBlob(item.url);
    const a = document.createElement("a");
    const leaf = item.name.split("/").pop() || item.name;
    a.href = URL.createObjectURL(blob);
    a.download = `${folderName}_${leaf}`;
    a.click();
    URL.revokeObjectURL(a.href);
    files.push(item.name);
  }
  return { folderName, files, mode: "download" };
}

export async function archiveAndMaybePurge(task: Task): Promise<ArchiveResult> {
  const settings = loadArchiveSettings();
  const result = await archiveTaskToLocal(task);
  if (settings.deleteRemoteAfterArchive) {
    await api.purgeTaskAssets(task.id);
  }
  return result;
}
