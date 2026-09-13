export interface LocalArchiveSettings {
  /** 已选本地目录显示名（浏览器安全策略不暴露完整路径） */
  folderName: string;
  /** 任务 success 后自动尝试归档 */
  autoArchiveOnSuccess: boolean;
  /** 本地保存成功后删除 ECS 上的文件 */
  deleteRemoteAfterArchive: boolean;
  /** 归档后提示运行百度云备份（见 Cursor 技能 learnv-baidu-backup） */
  remindBaiduBackup: boolean;
}

const STORAGE_KEY = "learnv_local_archive_settings_v1";

export const DEFAULT_ARCHIVE_SETTINGS: LocalArchiveSettings = {
  folderName: "",
  autoArchiveOnSuccess: false,
  deleteRemoteAfterArchive: true,
  remindBaiduBackup: true,
};

export function loadArchiveSettings(): LocalArchiveSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ARCHIVE_SETTINGS };
    return { ...DEFAULT_ARCHIVE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ARCHIVE_SETTINGS };
  }
}

export function saveArchiveSettings(settings: LocalArchiveSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
