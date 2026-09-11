#!/usr/bin/env bash
# ECS 一键：拉取 v1.0.3 → 诊断 Nginx → 配置子路径
# 用法: cd /opt/sunshinelife_ai_videos && sudo bash deploy/ecs/pull-and-run.sh
set -euo pipefail

APP_DIR="/opt/sunshinelife_ai_videos"
VERSION="v1.0.3"

cd "$APP_DIR"

echo ">>> git fetch --tags"
git fetch --tags

echo ">>> git checkout $VERSION"
git checkout "$VERSION"

echo ">>> 当前版本: $(git describe --tags --always)"
echo ">>> 诊断 Nginx"
bash deploy/ecs/diagnose-nginx.sh

echo ""
echo ">>> 配置 Nginx 子路径"
bash deploy/ecs/setup-nginx-subpath.sh

echo ""
echo "若应用尚未安装，请再执行:"
echo "  sudo bash deploy/ecs/install-subpath.sh"
