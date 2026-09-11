#!/usr/bin/env bash
# Manim 环境诊断
set -uo pipefail

echo "=== 字体（Text 渲染需要）==="
apt-get install -y fonts-dejavu-core fontconfig 2>/dev/null || true

echo "=== ffmpeg ==="
ffmpeg -version 2>&1 | head -1 || echo "未安装 ffmpeg"

echo ""
echo "=== python3 / manim ==="
python3 --version 2>&1 || true
manim --version 2>&1 || python3 -m manim --version 2>&1 || echo "Manim 未安装"

echo ""
echo "=== 试渲染 photon_breakdown（约 1～2 分钟）==="
cd /opt/sunshinelife_ai_videos/manim
OUT=/tmp/manim-test.mp4
rm -f "$OUT"
echo '{"type":"photon_breakdown","outputPath":"'"$OUT"'"}' | python3 render_task.py --stdin 2>&1 | tail -20
ls -lh "$OUT" 2>/dev/null || echo "未生成 $OUT"
file "$OUT" 2>/dev/null || true
