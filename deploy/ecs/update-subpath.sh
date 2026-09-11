#!/usr/bin/env bash
# 子路径模式日常更新
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
BASE_PATH="/sunshinelife_ai_videos"

cd "$APP_DIR"
if git symbolic-ref -q HEAD >/dev/null 2>&1; then
  git pull --ff-only
else
  git fetch --tags
  echo "detached HEAD，未执行 pull。可执行: git checkout main && git pull"
fi

export VITE_BASE_PATH="${BASE_PATH}/"
export VITE_API_BASE="${BASE_PATH}"
export NODE_ENV=production

pnpm install --frozen-lockfile || pnpm install
pnpm --filter remotion install || true
pnpm --filter backend build
pnpm --filter frontend build

# 构建后校验，避免白屏
if ! grep -q "${BASE_PATH}/assets/" frontend/dist/index.html; then
  echo "错误: frontend 构建路径不对，请运行: sudo bash deploy/ecs/fix-white-screen.sh"
  exit 1
fi

pm2 restart sunshinelife-videos-api
pm2 save

nginx -t && systemctl reload nginx

echo "更新完成 — $(git describe --tags --always)"
