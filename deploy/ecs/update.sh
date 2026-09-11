#!/usr/bin/env bash
# ECS 上更新到最新版本
# 用法: cd /opt/sunshinelife_ai_videos && sudo bash deploy/ecs/update.sh
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
cd "$APP_DIR"

echo "拉取最新代码..."
git fetch --tags
git pull --ff-only

echo "安装依赖..."
pnpm install --frozen-lockfile || pnpm install
pnpm --filter remotion install || true

echo "重新构建..."
pnpm build

echo "重启服务..."
pm2 restart sunshinelife-videos-api || pm2 start deploy/ecs/ecosystem.config.cjs
pm2 save

echo "更新完成 — $(git describe --tags --always)"
