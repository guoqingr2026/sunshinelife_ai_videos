#!/usr/bin/env bash
# 子路径模式日常更新
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
BASE_PATH="/sunshinelife_ai_videos"

cd "$APP_DIR"
git pull --ff-only

export VITE_BASE_PATH="${BASE_PATH}/"
export VITE_API_BASE="${BASE_PATH}"

pnpm install --frozen-lockfile || pnpm install
pnpm --filter remotion install || true
pnpm --filter backend build
pnpm --filter frontend build

pm2 restart sunshinelife-videos-api
pm2 save

nginx -t && systemctl reload nginx

echo "更新完成 — $(git describe --tags --always)"
