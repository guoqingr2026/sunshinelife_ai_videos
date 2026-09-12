#!/usr/bin/env bash
# 校验所有 Manim 模板 Python 语法（部署后快速自检）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/manim/templates"
fail=0
for f in *.py; do
  [[ "$f" == __* ]] && continue
  if ! python3 -m py_compile "$f"; then
    echo "SYNTAX ERROR: $f"
    fail=1
  fi
done
if ! python3 -c "import json; json.load(open('$ROOT/manim/locale/zh.json', encoding='utf-8'))"; then
  echo "locale/zh.json invalid"
  fail=1
fi
count=$(python3 -c "from template_catalog import TEMPLATES; print(len(TEMPLATES))" 2>/dev/null || echo "?")
if [[ $fail -eq 0 ]]; then
  echo "All Manim templates OK (registered: $count)"
else
  exit 1
fi
