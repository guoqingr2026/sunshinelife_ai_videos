#!/usr/bin/env bash
# 修复 Nginx 500（权限 + 静态资源配置）
# 用法: sudo bash deploy/ecs/fix-500.sh
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"

echo ">>> 1. 检查 dist 是否存在"
if [[ ! -f "$APP_DIR/frontend/dist/index.html" ]]; then
  echo "错误: 未找到 frontend/dist/index.html，请先构建:"
  echo "  export VITE_BASE_PATH=/sunshinelife_ai_videos/ VITE_API_BASE=/sunshinelife_ai_videos"
  echo "  pnpm --filter frontend build"
  exit 1
fi
ls -la "$APP_DIR/frontend/dist/index.html"

echo ">>> 2. 修复目录权限（nginx www-data 需能进入 /opt/...）"
chmod o+x /opt 2>/dev/null || true
chmod o+x "$APP_DIR" "$APP_DIR/frontend" 2>/dev/null || true
chmod -R a+rX "$APP_DIR/frontend/dist"
# 可选：交给 www-data
if id www-data &>/dev/null; then
  chown -R www-data:www-data "$APP_DIR/frontend/dist" || true
fi

echo ">>> 3. 更新 Nginx 片段"
mkdir -p /etc/nginx/snippets
cp "$APP_DIR/deploy/ecs/nginx-subpath.conf" /etc/nginx/snippets/sunshinelife_ai_videos.conf

echo ">>> 4. 重载 Nginx"
nginx -t
systemctl reload nginx

echo ">>> 5. 测试"
curl -sI http://127.0.0.1/sunshinelife_ai_videos/ | head -5
curl -s http://127.0.0.1/sunshinelife_ai_videos/api/health
echo ""
echo "若 HTTP 200，浏览器打开: http://47.99.184.249/sunshinelife_ai_videos/"
