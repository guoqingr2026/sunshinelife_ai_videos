# 本地归档与百度云备份

## 架构

```
浏览器 / PowerShell  →  下载成片 + 工程 ZIP  →  用户本地文件夹
                              ↓
                    POST /api/tasks/:id/purge-assets（可选）
                              ↓
                         ECS 释放磁盘
                              ↓
              Cursor 技能 learnv-baidu-backup → 百度网盘
```

## 网页操作（任务管理）

1. 打开 **任务管理** → **选择本地文件夹**（Chrome/Edge）
2. 勾选 **新任务成功后自动归档**、**归档后自动清理 ECS 文件**
3. 对历史任务点 **归档到本地**

未选文件夹时回退为浏览器下载，文件名含工程名前缀。

## PowerShell 批量同步

```powershell
cd C:\Users\guoqren\.cursor\Learnv
.\scripts\sync-ecs-to-local.ps1 -LocalRoot "D:\Videos\Learnv" -PurgeRemote
```

## 百度云

见个人技能：`~/.cursor/skills/learnv-baidu-backup/SKILL.md`

在 Cursor 中说：「把最新 Learnv 工程备份到百度云」。
