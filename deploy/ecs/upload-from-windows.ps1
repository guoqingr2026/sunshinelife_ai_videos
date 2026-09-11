# 从 Windows 上传代码到阿里云 ECS（无需 GitHub）
# 用法: .\deploy\ecs\upload-from-windows.ps1 -Host 你的ECS公网IP -User root
param(
    [Parameter(Mandatory = $true)]
    [string]$EcsHost,

    [string]$User = "root",
    [string]$RemoteDir = "/opt/sunshinelife_ai_videos",
    [string]$KeyPath = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host "打包项目（排除 node_modules、storage）..."
$archive = Join-Path $env:TEMP "sunshinelife_ai_videos.zip"
if (Test-Path $archive) { Remove-Item $archive -Force }

$exclude = @("node_modules", "backend\storage", ".git", "dist", "remotion\out", "*.mp4")
# 使用 tar（Windows 10+ 自带）
Push-Location $Root
tar -a -c -f $archive `
    --exclude=node_modules `
    --exclude=backend/storage `
    --exclude=.git `
    --exclude=dist `
    --exclude=remotion/out `
    .
Pop-Location

$sshArgs = @()
if ($KeyPath) { $sshArgs += @("-i", $KeyPath) }

Write-Host "上传到 ${User}@${EcsHost}..."
scp @sshArgs $archive "${User}@${EcsHost}:/tmp/sunshinelife_ai_videos.zip"

Write-Host "在 ECS 上解压并安装..."
$remoteScript = @"
set -e
mkdir -p $RemoteDir
cd $RemoteDir
if command -v unzip >/dev/null; then
  unzip -o /tmp/sunshinelife_ai_videos.zip -d $RemoteDir
else
  python3 -m zipfile -e /tmp/sunshinelife_ai_videos.zip $RemoteDir
fi
bash deploy/ecs/install.sh
"@

ssh @sshArgs "${User}@${EcsHost}" $remoteScript

Write-Host "完成。访问 http://${EcsHost}/"
