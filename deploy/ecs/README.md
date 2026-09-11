# 阿里云 ECS 部署 — sunshinelife_ai_videos

## 场景 A：与 englishlearn 等同域共存（推荐）

访问地址：`http://<你的ECS公网IP>/sunshinelife_ai_videos/`

后端独立端口 **3012**（不影响 englishlearn 的 3001 等端口）。

### 首次安装

```bash
# SSH 登录 ECS
sudo git clone https://github.com/guoqingr2026/sunshinelife_ai_videos.git /opt/sunshinelife_ai_videos
cd /opt/sunshinelife_ai_videos
sudo git checkout v1.0.1   # 或 main
sudo bash deploy/ecs/install-subpath.sh
```

### 配置 Nginx（只需做一次）

安装脚本会把片段写到 `/etc/nginx/snippets/sunshinelife_ai_videos.conf`。

在 **englishlearn 正在使用的** `server { }` 块内添加：

```nginx
include /etc/nginx/snippets/sunshinelife_ai_videos.conf;
```

常见配置文件：

- `/etc/nginx/sites-enabled/default`
- `/etc/nginx/conf.d/englishlearn.conf`（以你实际文件名为准）

然后：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 日常更新

```bash
cd /opt/sunshinelife_ai_videos
sudo bash deploy/ecs/update-subpath.sh
```

---

## 场景 B：独占整站（根路径 `/`）

```bash
sudo git clone https://github.com/guoqingr2026/sunshinelife_ai_videos.git /opt/sunshinelife_ai_videos
cd /opt/sunshinelife_ai_videos
sudo bash deploy/ecs/install.sh
```

访问：`http://<ECS公网IP>/`

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pm2 status` | 查看后端进程 |
| `pm2 logs sunshinelife-videos-api` | 查看日志 |
| `curl http://localhost:3012/api/health` | 子路径模式健康检查 |
| `curl http://<IP>/sunshinelife_ai_videos/api/health` | 经 Nginx 检查 |

## 环境变量

编辑 `/opt/sunshinelife_ai_videos/.env`，参考 `deploy/ecs/env.example`。
