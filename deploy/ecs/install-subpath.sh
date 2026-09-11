#!/usr/bin/env bash
# 与 englishlearn 等同域共存，挂载到 /sunshinelife_ai_videos
# 用法: sudo bash deploy/ecs/install-subpath.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="/opt/sunshinelife_ai_videos"
BASE_PATH="/sunshinelife_ai_videos"
API_PORT="3012"

echo "=========================================="
echo "  SunshineLife AI Videos — 子路径安装"
echo "  访问: http://<你的IP>${BASE_PATH}/"
echo "=========================================="

if [[ $EUID -ne 0 ]]; then
  echo "请使用 sudo 运行"
  exit 1
fi

# 仅安装本项目依赖，不覆盖已有 Nginx / 数据库
if command -v apt-get &>/dev/null; then
  apt-get update -y
  apt-get install -y git curl ffmpeg chromium-browser \
    build-essential python3 python3-pip python3-venv || true
fi

if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs || true
fi
if ! command -v pnpm &>/dev/null; then
  npm install -g pnpm pm2
else
  npm install -g pm2 || true
fi

if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git pull --ff-only
elif [[ -f "$SCRIPT_DIR/../../package.json" ]]; then
  APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
  cd "$APP_DIR"
else
  echo "请先 clone 仓库到 $APP_DIR"
  echo "  git clone https://github.com/guoqingr2026/sunshinelife_ai_videos.git $APP_DIR"
  exit 1
fi

# 环境变量（子路径 + 独立端口，避免与 englishlearn 冲突）
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

cd "$APP_DIR"
pnpm install --frozen-lockfile || pnpm install
pnpm --filter remotion install || true

echo "构建前端（子路径 ${BASE_PATH}）..."
export VITE_BASE_PATH="${BASE_PATH}/"
export VITE_API_BASE="${BASE_PATH}"
pnpm --filter backend build
pnpm --filter frontend build

python3 -m pip install -r "$APP_DIR/manim/requirements.txt" 2>/dev/null || echo "Manim 可选，已跳过"

pm2 delete sunshinelife-videos-api 2>/dev/null || true
PORT=${API_PORT} pm2 start deploy/ecs/ecosystem.config.cjs --update-env
pm2 save

mkdir -p /etc/nginx/snippets
cp "$APP_DIR/deploy/ecs/nginx-subpath.conf" /etc/nginx/snippets/sunshinelife_ai_videos.conf

echo ""
echo "------------------------------------------"
echo "Nginx 配置片段已写入:"
echo "  /etc/nginx/snippets/sunshinelife_ai_videos.conf"
echo ""
echo "请在 englishlearn 使用的 server { } 块内添加一行:"
echo "  include /etc/nginx/snippets/sunshinelife_ai_videos.conf;"
echo ""
echo "常见位置:"
echo "  /etc/nginx/sites-enabled/default"
echo "  /etc/nginx/conf.d/*.conf"
echo "------------------------------------------"

if nginx -t 2>/dev/null; then
  systemctl reload nginx || service nginx reload
  echo "Nginx 已 reload"
else
  echo "请先添加 include 后再执行: sudo nginx -t && sudo systemctl reload nginx"
fi

echo ""
echo "=========================================="
echo "  安装完成"
echo "  页面: http://<你的IP>${BASE_PATH}/"
echo "  API:  http://<你的IP>${BASE_PATH}/api/health"
echo "  日志: pm2 logs sunshinelife-videos-api"
echo "=========================================="
