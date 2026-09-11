#!/usr/bin/env bash
# 修复白屏：重建前端 + 校验资源路径 + 重启后端
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
BASE_PATH="/sunshinelife_ai_videos"

cd "$APP_DIR"

echo ">>> 1. 拉取代码"
git pull origin main

echo ">>> 2. 安装依赖"
pnpm install --frozen-lockfile || pnpm install

echo ">>> 3. 构建 backend + frontend"
export VITE_BASE_PATH="${BASE_PATH}/"
export VITE_API_BASE="${BASE_PATH}"
export NODE_ENV=production
pnpm --filter backend build
pnpm --filter frontend build

echo ">>> 4. 校验 dist（防止白屏）"
INDEX="$APP_DIR/frontend/dist/index.html"
if [[ ! -f "$INDEX" ]]; then
  echo "错误: 未找到 frontend/dist/index.html，构建失败"
  exit 1
fi
if ! grep -q "${BASE_PATH}/assets/" "$INDEX"; then
  echo "错误: index.html 未包含 ${BASE_PATH}/assets/ — 资源路径错误，会白屏"
  grep -E 'src=|href=' "$INDEX" || true
  exit 1
fi
JS_FILE=$(grep -oP "(?<=${BASE_PATH}/assets/)[^\"']+\\.js" "$INDEX" | head -1)
if [[ -z "$JS_FILE" ]] || [[ ! -f "$APP_DIR/frontend/dist/assets/$JS_FILE" ]]; then
  echo "错误: JS 文件不存在 — index.html 引用了已删除的 bundle"
  ls -la "$APP_DIR/frontend/dist/assets/" || true
  exit 1
fi
echo "OK: index.html -> ${BASE_PATH}/assets/$JS_FILE"

echo ">>> 5. 权限 + 重启"
chmod -R a+rX frontend/dist
pm2 restart sunshinelife-videos-api || pm2 start deploy/ecs/ecosystem.config.cjs
pm2 save
nginx -t && systemctl reload nginx

echo ">>> 6. HTTP 自检"
curl -sf "http://127.0.0.1${BASE_PATH}/api/health" | head -c 200
echo ""
curl -sI "http://127.0.0.1${BASE_PATH}/assets/$JS_FILE" | head -3
curl -sI "http://127.0.0.1${BASE_PATH}/" | head -3

echo ""
echo "完成。浏览器请 Ctrl+Shift+R 强刷:"
echo "  http://47.99.184.249${BASE_PATH}/"
