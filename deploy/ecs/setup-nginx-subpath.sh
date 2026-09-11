#!/usr/bin/env bash
# 自动把 sunshinelife_ai_videos 挂到正确的 server 块
# 用法: sudo bash deploy/ecs/setup-nginx-subpath.sh
set -euo pipefail

INCLUDE_LINE='include /etc/nginx/snippets/sunshinelife_ai_videos.conf;'
SNIPPET_SRC="/opt/sunshinelife_ai_videos/deploy/ecs/nginx-subpath.conf"
SNIPPET_DST="/etc/nginx/snippets/sunshinelife_ai_videos.conf"

collect_nginx_files() {
  find /etc/nginx/sites-enabled /etc/nginx/sites-available /etc/nginx/conf.d \
    -maxdepth 1 \( -type f -o -type l \) 2>/dev/null | sort -u
}

find_nginx_site() {
  local f marker

  # 1) englishlearn 官方 snippet 名
  for f in $(collect_nginx_files); do
    [[ -f "$f" ]] || continue
    if grep -q "pep6-english-location.conf" "$f" 2>/dev/null; then
      echo "$f"
      return 0
    fi
  done

  # 2) 内联 /english 子路径（未用 snippet 文件名时）
  for f in $(collect_nginx_files); do
    [[ -f "$f" ]] || continue
    if grep -qE "location[[:space:]]+(/english|=/english)" "$f" 2>/dev/null; then
      echo "$f"
      return 0
    fi
  done

  # 3) pep6-english 独立站点（根路径或子路径模式）
  for f in /etc/nginx/sites-enabled/pep6-english /etc/nginx/sites-available/pep6-english; do
    if [[ -f "$f" ]]; then
      echo "$f"
      return 0
    fi
  done

  # 4) 含 8080 反向代理的配置（pep6 后端端口）
  for f in $(collect_nginx_files); do
    [[ -f "$f" ]] || continue
    if grep -q "127.0.0.1:8080" "$f" 2>/dev/null; then
      echo "$f"
      return 0
    fi
  done

  # 5) nginx -T 解析出的 listen 80 配置文件
  if command -v nginx &>/dev/null; then
    marker=$(nginx -T 2>/dev/null | grep -B5 "listen 80" | grep "^# configuration file" | head -1 | sed 's/^# configuration file //' | tr -d ':')
    if [[ -n "$marker" && -f "$marker" ]]; then
      echo "$marker"
      return 0
    fi
  fi

  # 6) 常见默认路径（含阿里云）
  for f in \
    /etc/nginx/sites-enabled/default \
    /etc/nginx/conf.d/default.conf \
    /etc/nginx/nginx.conf; do
    if [[ -f "$f" ]] && grep -q "listen 80" "$f" 2>/dev/null; then
      echo "$f"
      return 0
    fi
  done

  return 1
}

insert_include() {
  local site="$1"
  if grep -q "sunshinelife_ai_videos.conf" "$site"; then
    echo "已存在 include，跳过"
    return 0
  fi

  local backup="${site}.bak.$(date +%Y%m%d%H%M%S)"
  cp "$site" "$backup"
  echo "已备份: $backup"

  if grep -q "pep6-english-location.conf" "$site"; then
    sed -i '/pep6-english-location.conf;/a\    include /etc/nginx/snippets/sunshinelife_ai_videos.conf;' "$site"
    echo "已在 pep6-english-location include 下方插入"
  elif grep -qE "location[[:space:]]+(/english|=/english)" "$site"; then
    sed -i '0,/location.*english/s//    include \/etc\/nginx\/snippets\/sunshinelife_ai_videos.conf;\n&/' "$site"
    echo "已在 /english location 之前插入"
  elif grep -q "server {" "$site"; then
    sed -i '0,/server {/s//server {\n    include \/etc\/nginx\/snippets\/sunshinelife_ai_videos.conf;/' "$site"
    echo "已在 server { 块开头插入"
  else
    echo "错误: $site 中找不到 server { 块"
    return 1
  fi
}

if [[ $EUID -ne 0 ]]; then
  echo "请使用 sudo 运行"
  exit 1
fi

if [[ ! -f "$SNIPPET_SRC" ]]; then
  echo "错误: 未找到 $SNIPPET_SRC"
  exit 1
fi

mkdir -p /etc/nginx/snippets
cp "$SNIPPET_SRC" "$SNIPPET_DST"
echo "[1/4] 已写入片段: $SNIPPET_DST"

echo "[2/4] 自动查找 Nginx 站点配置..."
NGINX_SITE=""
if NGINX_SITE=$(find_nginx_site); then
  echo "      找到: $NGINX_SITE"
else
  echo ""
  echo "未自动找到配置文件。请先运行诊断:"
  echo "  sudo bash deploy/ecs/diagnose-nginx.sh"
  echo ""
  echo "然后把 /tmp/nginx-diagnose-*.txt 内容发来。"
  exit 1
fi

echo "[3/4] 写入 include..."
insert_include "$NGINX_SITE"

echo "[4/4] 校验并重载..."
nginx -t
systemctl reload nginx

echo ""
echo "=========================================="
echo "  Nginx 配置成功"
echo "  修改文件: $NGINX_SITE"
echo "  英语学习: http://47.99.184.249/english/  (若已配置子路径)"
echo "  动画系统: http://47.99.184.249/sunshinelife_ai_videos/"
echo "=========================================="
