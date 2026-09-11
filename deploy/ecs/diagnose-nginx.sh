#!/usr/bin/env bash
# 在 ECS 上诊断 Nginx 实际配置 — 找出 englishlearn 与 80 端口站点
# 用法: sudo bash deploy/ecs/diagnose-nginx.sh
set -uo pipefail

OUT="/tmp/nginx-diagnose-$(date +%Y%m%d%H%M%S).txt"
exec > >(tee "$OUT") 2>&1

echo "=========================================="
echo "  Nginx 诊断报告"
echo "  输出文件: $OUT"
echo "=========================================="
echo ""

echo ">>> 1. Nginx 版本与状态"
nginx -v 2>&1 || true
systemctl is-active nginx 2>&1 || true
echo ""

echo ">>> 2. sites-enabled / sites-available / conf.d 列表"
ls -la /etc/nginx/sites-enabled/ 2>&1 || echo "(无 sites-enabled)"
ls -la /etc/nginx/sites-available/ 2>&1 || echo "(无 sites-available)"
ls -la /etc/nginx/conf.d/ 2>&1 || echo "(无 conf.d)"
echo ""

echo ">>> 3. 搜索 english / pep6 / 8080 / sunshinelife"
grep -rn "english\|pep6\|8080\|sunshinelife" /etc/nginx/ 2>/dev/null || echo "(无匹配)"
echo ""

echo ">>> 4. 搜索 listen 80"
grep -rn "listen 80" /etc/nginx/ 2>/dev/null || echo "(无 listen 80)"
echo ""

echo ">>> 5. snippets 目录"
ls -la /etc/nginx/snippets/ 2>/dev/null || echo "(无 snippets)"
echo ""

echo ">>> 6. pep6-english 服务与环境"
systemctl is-active pep6-english 2>&1 || true
cat /etc/pep6-english/env 2>/dev/null || echo "(无 /etc/pep6-english/env)"
echo ""

echo ">>> 7. nginx -T 摘要（配置文件路径 + server 块）"
nginx -T 2>/dev/null | grep -E "^# configuration file|listen 80|server_name|/english|pep6|8080|sunshinelife" || echo "(nginx -T 失败)"
echo ""

echo ">>> 8. 各站点文件内容预览"
for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [[ -e "$f" ]] || continue
  echo "--- $f ---"
  cat "$f"
  echo ""
done

echo "=========================================="
echo "  请把此文件内容发给我: $OUT"
echo "  或执行: sudo bash deploy/ecs/setup-nginx-subpath.sh"
echo "=========================================="
