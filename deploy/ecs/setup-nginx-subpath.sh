#!/usr/bin/env bash
# 自动把 sunshinelife_ai_videos 挂到与 englishlearn 相同的 server 块
# 用法: sudo bash deploy/ecs/setup-nginx-subpath.sh
set -euo pipefail

INCLUDE_LINE='include /etc/nginx/snippets/sunshinelife_ai_videos.conf;'
SNIPPET_SRC="/opt/sunshinelife_ai_videos/deploy/ecs/nginx-subpath.conf"
SNIPPET_DST="/etc/nginx/snippets/sunshinelife_ai_videos.conf"
PEP6_MARKER="pep6-english-location.conf"

if [[ $EUID -ne 0 ]]; then
  echo "请使用 sudo 运行"
  exit 1
fi

if [[ ! -f "$SNIPPET_SRC" ]]; then
  echo "错误: 未找到 $SNIPPET_SRC，请先 clone 到 /opt/sunshinelife_ai_videos"
  exit 1
fi

mkdir -p /etc/nginx/snippets
cp "$SNIPPET_SRC" "$SNIPPET_DST"
echo "[1/4] 已写入片段: $SNIPPET_DST"

# 优先：与 englishlearn 相同 — 找到已 include pep6 的那个 server 配置文件
NGINX_SITE=""
while IFS= read -r f; do
  if grep -q "$PEP6_MARKER" "$f" 2>/dev/null; then
    NGINX_SITE="$f"
    break
  fi
done < <(find /etc/nginx/sites-enabled /etc/nginx/conf.d -type f 2>/dev/null | sort)

# 其次：sites-enabled 里第一个 listen 80 的站点（排除 pep6 独占配置）
if [[ -z "$NGINX_SITE" ]]; then
  while IFS= read -r f; do
    if grep -q "listen 80" "$f" 2>/dev/null && ! grep -q "pep6-english" "$f" 2>/dev/null; then
      NGINX_SITE="$f"
      break
    fi
  done < <(find /etc/nginx/sites-enabled /etc/nginx/conf.d -type f 2>/dev/null | sort)
fi

# 最后兜底
if [[ -z "$NGINX_SITE" ]] && [[ -f /etc/nginx/sites-enabled/default ]]; then
  NGINX_SITE="/etc/nginx/sites-enabled/default"
fi

if [[ -z "$NGINX_SITE" ]] || [[ ! -f "$NGINX_SITE" ]]; then
  echo "错误: 找不到可修改的 Nginx 站点配置。"
  echo "请手动在 server { } 内添加:"
  echo "  $INCLUDE_LINE"
  exit 1
fi

echo "[2/4] 目标配置文件: $NGINX_SITE"

if grep -q "sunshinelife_ai_videos.conf" "$NGINX_SITE"; then
  echo "已存在 include，跳过修改"
else
  BACKUP="${NGINX_SITE}.bak.$(date +%Y%m%d%H%M%S)"
  cp "$NGINX_SITE" "$BACKUP"
  echo "      已备份: $BACKUP"

  if grep -q "$PEP6_MARKER" "$NGINX_SITE"; then
    # 紧跟 englishlearn 的 include（与 DEPLOY.md 一致）
    sed -i "/${PEP6_MARKER//\//\\/};/a\\    ${INCLUDE_LINE}" "$NGINX_SITE"
    echo "[3/4] 已在 pep6-english include 下方插入"
  else
    # 在 server { 后第一行插入
    sed -i "0,/server {/s//server {\n    ${INCLUDE_LINE}/" "$NGINX_SITE"
    echo "[3/4] 已在 server { 块开头插入"
  fi
fi

echo "[4/4] 校验并重载 Nginx..."
nginx -t
systemctl reload nginx

echo ""
echo "=========================================="
echo "  Nginx 配置成功"
echo "  英语学习: http://47.99.184.249/english/"
echo "  动画系统: http://47.99.184.249/sunshinelife_ai_videos/"
echo "  配置文件: $NGINX_SITE"
echo "=========================================="
