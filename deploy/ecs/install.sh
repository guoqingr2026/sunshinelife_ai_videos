#!/usr/bin/env bash
# 阿里云 ECS 首次安装 sunshinelife_ai_videos
# 用法: bash deploy/ecs/install.sh [git-repo-url]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="/opt/sunshinelife_ai_videos"
REPO_URL="${1:-}"

echo "=========================================="
echo "  SunshineLife AI Videos — ECS 安装"
echo "=========================================="

if [[ $EUID -ne 0 ]]; then
  echo "请使用 root 或 sudo 运行: sudo bash deploy/ecs/install.sh <repo-url>"
  exit 1
fi

# 基础依赖
if command -v apt-get &>/dev/null; then
  apt-get update -y
  apt-get install -y git curl nginx ffmpeg chromium-browser \
    build-essential python3 python3-pip python3-venv
elif command -v yum &>/dev/null; then
  yum install -y git curl nginx ffmpeg chromium python3 python3-pip
else
  echo "请手动安装: git curl nginx ffmpeg chromium python3"
fi

# Node.js 20 + pnpm
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs || true
fi
if ! command -v pnpm &>/dev/null; then
  npm install -g pnpm pm2
else
  npm install -g pm2 || true
fi

# 克隆或更新代码
if [[ -d "$APP_DIR/.git" ]]; then
  echo "目录已存在，执行 git pull..."
  cd "$APP_DIR"
  git pull --ff-only
elif [[ -n "$REPO_URL" ]]; then
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
elif [[ -f "$SCRIPT_DIR/../../package.json" ]]; then
  APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
  echo "使用当前仓库目录: $APP_DIR"
  cd "$APP_DIR"
else
  echo "错误: 请提供 Git 仓库地址，或先 clone 到 $APP_DIR"
  echo "示例: sudo bash deploy/ecs/install.sh https://github.com/你的用户名/sunshinelife_ai_videos.git"
  exit 1
fi

# 环境变量
if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/deploy/ecs/env.example" "$APP_DIR/.env"
  # 尝试自动检测 Chromium
  for chrome in /usr/bin/chromium-browser /usr/bin/chromium /usr/bin/google-chrome; do
    if [[ -x "$chrome" ]]; then
      echo "REMOTION_BROWSER_EXECUTABLE=$chrome" >> "$APP_DIR/.env"
      break
    fi
  done
fi

mkdir -p "$APP_DIR/backend/storage/files"

echo "安装 Node 依赖..."
cd "$APP_DIR"
pnpm install --frozen-lockfile || pnpm install
pnpm --filter remotion install || true

echo "构建项目..."
pnpm build

echo "安装 Manim（可选，Python 3）..."
python3 -m pip install --upgrade pip || true
python3 -m pip install -r "$APP_DIR/manim/requirements.txt" || echo "Manim 安装跳过（可稍后手动安装）"

echo "启动 PM2..."
cd "$APP_DIR"
pm2 delete sunshinelife-videos-api 2>/dev/null || true
pm2 start deploy/ecs/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "配置 Nginx..."
cp "$APP_DIR/deploy/ecs/nginx.conf" /etc/nginx/conf.d/sunshinelife_ai_videos.conf
nginx -t && systemctl enable nginx && systemctl restart nginx

echo ""
echo "=========================================="
echo "  安装完成"
echo "  目录: $APP_DIR"
echo "  前端: http://<ECS公网IP>/"
echo "  API:  http://<ECS公网IP>/api/health"
echo "  日志: pm2 logs sunshinelife-videos-api"
echo "=========================================="
