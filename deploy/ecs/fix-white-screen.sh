#!/usr/bin/env bash
# 修复白屏：通常是 frontend 构建时缺少 VITE_BASE_PATH，导致 JS 404
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
BASE_PATH="/sunshinelife_ai_videos"

cd "$APP_DIR"

echo ">>> 1. 拉取最新代码"
git pull origin main || true

echo ">>> 2. 构建（使用 .env.production 子路径配置）"
export VITE_BASE_PATH="${BASE_PATH}/"
export VITE_API_BASE="${BASE_PATH}"
pnpm install --frozen-lockfile || pnpm install
pnpm --filter backend build
pnpm --filter frontend build

echo ">>> 3. 检查 dist 资源路径"
if ! grep -q "${BASE_PATH}/assets/" frontend/dist/index.html; then
  echo "错误: index.html 未包含 ${BASE_PATH}/assets/ — 构建路径不对"
  exit 1
fi
ls -la frontend/dist/assets/*.js | head -3

echo ">>> 4. 权限 + 重启"
chmod -R a+rX frontend/dist
pm2 restart sunshinelife-videos-api
nginx -t && systemctl reload nginx

echo ">>> 5. 自检"
curl -sI "http://127.0.0.1${BASE_PATH}/" | head -3
JS=$(grep -oP '(?<=src=")[^"]+\.js' frontend/dist/index.html | head -1)
curl -sI "http://127.0.0.1${JS}" | head -3
curl -s "http://127.0.0.1${BASE_PATH}/api/health"

echo ""
echo "若 JS 返回 200，浏览器强刷 Ctrl+F5 打开:"
echo "  http://47.99.184.249${BASE_PATH}/"
