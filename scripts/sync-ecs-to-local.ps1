# 从 ECS 拉取已完成任务到本地，并按工程名建文件夹；可选删除远端文件
# 用法:
#   .\scripts\sync-ecs-to-local.ps1 -LocalRoot "D:\Videos\Learnv"
#   .\scripts\sync-ecs-to-local.ps1 -EcsBase "http://47.99.184.249/sunshinelife_ai_videos" -PurgeRemote

param(
    [string]$EcsBase = "http://47.99.184.249/sunshinelife_ai_videos",
    [string]$LocalRoot = "$env:USERPROFILE\Videos\LearnvProjects",
    [switch]$PurgeRemote
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $LocalRoot | Out-Null

$tasks = Invoke-RestMethod -Uri "$EcsBase/api/tasks" -Method Get
$done = $tasks | Where-Object { $_.status -eq "success" }

Write-Host "ECS: $EcsBase"
Write-Host "本地目录: $LocalRoot"
Write-Host "待同步成功任务: $($done.Count)"

foreach ($task in $done) {
    $payload = $task.payload
    $title = $payload.title
    if (-not $title -and $payload.project.title) { $title = $payload.project.title }
    if (-not $title) { $title = $task.kind }
    $slug = ($title -replace '[^\w\u4e00-\u9fff-]+', '_').Trim('_')
    if (-not $slug) { $slug = $task.kind }
    if ($slug.Length -gt 48) { $slug = $slug.Substring(0, 48) }
    $date = ([DateTime]$task.createdAt).ToString("yyyy-MM-dd")
    $folderName = "${slug}_${date}_$($task.id.Substring(0,8))"
    $dest = Join-Path $LocalRoot $folderName
    New-Item -ItemType Directory -Force -Path $dest | Out-Null

    if ($task.outputUrl) {
        $mp4Url = if ($task.outputUrl -match '^https?://') { $task.outputUrl } else { "$EcsBase$($task.outputUrl)" }
        $mp4Path = Join-Path $dest "final.mp4"
        Write-Host "  -> $mp4Path"
        Invoke-WebRequest -Uri $mp4Url -OutFile $mp4Path
    }

    if ($task.kind -eq "compose") {
        $zipUrl = "$EcsBase/api/video/compose/$($task.id)/bundle"
        $zipPath = Join-Path $dest "project-bundle.zip"
        try {
            Write-Host "  -> $zipPath"
            Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
        } catch {
            Write-Warning "  工程 ZIP 不可用: $_"
        }
    }

    if ($PurgeRemote) {
        Write-Host "  清理 ECS: $($task.id)"
        Invoke-RestMethod -Uri "$EcsBase/api/tasks/$($task.id)/purge-assets" -Method Post | Out-Null
    }
}

Write-Host "完成。可将 $LocalRoot 同步到百度云（见 Cursor 技能 learnv-baidu-backup）。"
