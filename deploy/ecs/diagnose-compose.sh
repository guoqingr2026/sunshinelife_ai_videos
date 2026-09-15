#!/usr/bin/env bash
# 一键成片无反应 / 进度条不动 — 快速诊断
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "=== 1. PM2 API 进程 ==="
pm2 list 2>/dev/null | grep -E "sunshinelife|online|stopped|errored" || echo "(pm2 未安装或无进程)"

echo ""
echo "=== 2. 健康检查 ==="
PORT="${PORT:-3012}"
for p in "$PORT" 3001 3012; do
  if curl -sf "http://127.0.0.1:${p}/api/health" >/dev/null 2>&1; then
    echo "OK: http://127.0.0.1:${p}/api/health"
    PORT="$p"
    break
  fi
done
curl -sf "http://127.0.0.1:${PORT}/api/health" && echo "" || echo "FAIL: 本地 API /api/health 不可达（检查 PORT 与 pm2）"

echo ""
echo "=== 3. 子路径健康（若 nginx 反代）==="
curl -sf "http://127.0.0.1/sunshinelife_ai_videos/api/health" 2>/dev/null && echo "" || echo "(跳过或失败 — 视 nginx 配置)"

echo ""
echo "=== 4. 最近任务（data.json）==="
python3 <<'PY'
import json, os
p = os.path.join("backend", "storage", "data.json")
if not os.path.exists(p):
    print("无 data.json")
else:
    d = json.load(open(p))
    tasks = sorted(d.get("tasks", []), key=lambda t: t.get("createdAt", ""), reverse=True)[:8]
    for t in tasks:
        print(f"  {t.get('status'):8} {t.get('kind'):10} {t.get('id','')[:8]}… {t.get('error','')[:60]}")
PY

echo ""
echo "=== 5. 卡住的任务（running 超过 30 分钟）==="
python3 <<'PY'
import json, os
from datetime import datetime, timezone
p = os.path.join("backend", "storage", "data.json")
if os.path.exists(p):
    d = json.load(open(p))
    now = datetime.now(timezone.utc)
    for t in d.get("tasks", []):
        if t.get("status") != "running":
            continue
        u = t.get("updatedAt", t.get("createdAt", ""))
        print(f"  STUCK? {t.get('kind')} {t.get('id')[:8]} updated={u}")
PY

echo ""
echo "=== 6. 素材库 uploads（注意：在 backend/storage，不是项目根 files/）==="
UPLOADS="$ROOT/backend/storage/files/uploads"
if [[ -d "$UPLOADS" ]]; then
  ls -la "$UPLOADS" | head -20
  if [[ -f "$UPLOADS/manifest.json" ]]; then
    echo "--- manifest.json ---"
    python3 -c "import json; d=json.load(open('$UPLOADS/manifest.json')); print(len(d.get('assets',[])), 'assets'); [print(' ',a.get('filename')) for a in d.get('assets',[])[:10]]"
  fi
else
  echo "目录不存在: $UPLOADS"
fi
curl -sf -o /dev/null -w "HTTP %{http_code} " "http://127.0.0.1:${PORT}/api/assets" 2>/dev/null && echo "/api/assets" || echo "FAIL /api/assets"

echo ""
echo "=== 7. Manim / Node ==="
python3 -m manim --version 2>/dev/null | head -1 || echo "Manim 未安装"
node -v 2>/dev/null || true

echo ""
echo "=== 建议 ==="
echo "  pm2 logs sunshinelife-videos-api --lines 40"
echo "  pm2 restart sunshinelife-videos-api"
echo "  数学题·完整版含 ~11 个 Manim，约 20–40 分钟；建议先用「数学题·快速版」（6 个 Manim）"
echo "  切换示例后若右侧仍显示 MVP 成片，点「重置界面状态」再点「一键生成」"
echo "  进度条应在提交后几秒内出现 2%；若无，看浏览器 F12 → Network → POST .../api/video/compose"
