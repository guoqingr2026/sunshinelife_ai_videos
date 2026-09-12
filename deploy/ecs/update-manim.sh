#!/usr/bin/env bash
# Pull latest Manim templates and restart API (run on ECS after git push)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
echo "==> git pull"
git pull origin main
echo "==> verify templates"
bash deploy/ecs/verify-manim-templates.sh
echo "==> restart API"
pm2 restart sunshinelife-videos-api
echo "Done. Test Manim page — expect real MP4, not placeholder."
