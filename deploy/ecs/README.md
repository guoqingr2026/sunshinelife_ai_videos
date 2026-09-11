# 阿里云 ECS 部署 — sunshinelife_ai_videos

## 前置条件

- 阿里云 ECS（推荐 Ubuntu 22.04，2核4G+）
- 安全组放行 **80**（HTTP）、如需直连 API 可放行 **3001**
- 已创建 GitHub 仓库并推送代码

## 首次安装（在 ECS 上执行）

```bash
# SSH 登录 ECS 后
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/你的用户名/sunshinelife_ai_videos/v1.0/deploy/ecs/install.sh)" \
  -- https://github.com/你的用户名/sunshinelife_ai_videos.git
```

或克隆后本地执行：

```bash
git clone https://github.com/你的用户名/sunshinelife_ai_videos.git /opt/sunshinelife_ai_videos
cd /opt/sunshinelife_ai_videos
sudo bash deploy/ecs/install.sh
```

安装脚本会完成：Node/pnpm、Nginx、FFmpeg、Chromium、构建、PM2 守护、Manim（尽力安装）。

## 日常更新

```bash
cd /opt/sunshinelife_ai_videos
sudo bash deploy/ecs/update.sh
```

或切换到指定版本：

```bash
cd /opt/sunshinelife_ai_videos
git fetch --tags
git checkout v1.0
sudo bash deploy/ecs/update.sh
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pm2 status` | 查看后端进程 |
| `pm2 logs sunshinelife-videos-api` | 查看日志 |
| `curl localhost:3001/api/health` | 健康检查 |
| `nginx -t && systemctl reload nginx` | 重载 Nginx |

## 环境变量

编辑 `/opt/sunshinelife_ai_videos/.env`，参考 `deploy/ecs/env.example`。

## Nginx

配置文件：`deploy/ecs/nginx.conf`  
部署后位于：`/etc/nginx/conf.d/sunshinelife_ai_videos.conf`  
请将 `YOUR_DOMAIN` 改为 ECS 公网 IP 或域名。
