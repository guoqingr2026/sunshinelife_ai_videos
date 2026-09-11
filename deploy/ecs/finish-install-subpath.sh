#!/usr/bin/env bash
# 安装被 git pull 中断后，从构建步骤继续（不跑 apt / git pull）
# 用法: cd /opt/sunshinelife_ai_videos && sudo bash deploy/ecs/finish-install-subpath.sh
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
BASE_PATH="/sunshinelife_ai_videos"
API_PORT="3012"

cd "$APP_DIR"

echo ">>> 继续安装（跳过 apt 与 git pull）"
echo ">>> 当前版本: $(git describe --tags --always 2>/dev/null || echo unknown)"

if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/deploy/ecs/env.example" "$APP_DIR/.env"
fi
grep -q "^PORT=" "$APP_DIR/.env" && sed -i "s/^PORT=.*/PORT=${API_PORT}/" "$APP_DIR/.env" || echo "PORT=${API_PORT}" >> "$APP_DIR/.env"
grep -q "^PUBLIC_BASE_PATH=" "$APP_DIR/.env" && sed -i "s|^PUBLIC_BASE_PATH=.*|PUBLIC_BASE_PATH=${BASE_PATH}|" "$APP_DIR/.env" || echo "PUBLIC_BASE_PATH=${BASE_PATH}" >> "$APP_DIR/.env"

for chrome in /usr/bin/chromium-browser /usr/bin/chromium /usr/bin/google-chrome; do
  if [[ -x "$chrome" ]] && ! grep -q REMOTION_BROWSER_EXECUTABLE "$APP_DIR/.env"; then
    echo "REMOTION_BROWSER_EXECUTABLE=$chrome" >> "$APP_DIR/.env"
    break
  fi
done

mkdir -p "$APP_DIR/backend/storage/files"

echo ">>> pnpm install"
pnpm install --frozen-lockfile || pnpm install
pnpm --filter remotion install || true

echo ">>> 构建（子路径 ${BASE_PATH}）"
export VITE_BASE_PATH="${BASE_PATH}/"
export VITE_API_BASE="${BASE_PATH}"
pnpm --filter backend build
pnpm --filter frontend build

python3 -m pip install -r "$APP_DIR/manim/requirements.txt" 2>/dev/null || echo "Manim 可选，已跳过"

echo ">>> 启动 PM2"
pm2 delete sunshinelife-videos-api 2>/dev/null || true
PORT=${API_PORT} pm2 start deploy/ecs/ecosystem.config.cjs --update-env
pm2 save

echo ">>> 修复静态文件权限"
chmod o+x /opt 2>/dev/null || true
chmod o+x "$APP_DIR" "$APP_DIR/frontend" 2>/dev/null || true
chmod -R a+rX "$APP_DIR/frontend/dist"

echo ">>> 配置 Nginx"
bash "$APP_DIR/deploy/ecs/setup-nginx-subpath.sh"

echo ""
echo "=========================================="
echo "  安装完成"
echo "  http://47.99.184.249${BASE_PATH}/"
echo "  pm2 logs sunshinelife-videos-api"
echo "=========================================="
