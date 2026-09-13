#!/usr/bin/env bash
# Manim 中文显示：安装 CJK 字体（解决白框）
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq fonts-noto-cjk fonts-wqy-zenhei fonts-arphic-ukai fontconfig
fc-cache -fv
echo "已安装中文字体（含文鼎楷体 AR PL UKai CN，供楷体预设映射）。"
echo "可用: fc-list :lang=zh | head -8"
