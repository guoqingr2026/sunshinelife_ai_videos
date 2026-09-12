#!/usr/bin/env bash
# Pull latest Manim templates and restart API (run on ECS after git push)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
echo "==> git pull"
git pull origin main
echo "==> verify templates"
bash deploy/ecs/verify-manim-templates.sh
echo "==> optional capabilities (run manually if needed)"
echo "    sudo bash deploy/ecs/install-texlive-optional.sh   # MathTex / LaTeX"
echo "    sudo bash deploy/ecs/install-opengl-deps.sh        # ThreeDScene / OpenGL"
echo "==> restart API"
pm2 restart sunshinelife-videos-api
echo "Done. Test Manim page — expect real MP4, not placeholder."
echo "Automation guide: docs/manim-automation-guide.md"
