# Nginx 子路径配置（与 englishlearn 共存）

你的 ECS 现有结构（来自 englishlearn 部署文档）：

| 项目 | 值 |
|------|-----|
| ECS IP | `47.99.184.249` |
| 根网站 | `http://47.99.184.249/` |
| 英语学习 | `http://47.99.184.249/english/` |
| english 片段 | `/etc/nginx/snippets/pep6-english-location.conf` |
| 动画系统 | `http://47.99.184.249/sunshinelife_ai_videos/` |
| 动画片段 | `/etc/nginx/snippets/sunshinelife_ai_videos.conf` |

---

## 推荐：自动配置（避免放错位置）

```bash
cd /opt/sunshinelife_ai_videos
sudo bash deploy/ecs/setup-nginx-subpath.sh
```

脚本会：

1. 写入 `/etc/nginx/snippets/sunshinelife_ai_videos.conf`
2. **自动找到** 已包含 `pep6-english-location.conf` 的那个 `server { }` 配置文件
3. 在 englishlearn 的 `include` **下一行**插入动画系统的 `include`
4. 备份原文件 → `nginx -t` → `reload`

---

## 手动配置（仅当自动脚本失败时）

### 第 1 步：找到正确的配置文件

```bash
sudo grep -r "pep6-english-location" /etc/nginx/sites-enabled /etc/nginx/conf.d
```

输出示例：

```
/etc/nginx/sites-enabled/default:    include /etc/nginx/snippets/pep6-english-location.conf;
```

**只改这一份文件**（就是 englishlearn 正在用的那份）。

> 常见错误：去改 `/etc/nginx/sites-available/pep6-english` 或新建一个 `server { listen 80; }` —— 会与现有站点冲突，导致 englishlearn 或根网站异常。

### 第 2 步：确认片段文件存在

```bash
sudo cp /opt/sunshinelife_ai_videos/deploy/ecs/nginx-subpath.conf \
        /etc/nginx/snippets/sunshinelife_ai_videos.conf
```

### 第 3 步：在 server { } 内添加 include

编辑上一步找到的文件（假设是 `default`）：

```bash
sudo nano /etc/nginx/sites-enabled/default
```

在 **`server {` 大括号内部**，紧挨 englishlearn 的 include **下面**加一行：

```nginx
server {
    listen 80;
    server_name _;

    # englishlearn（已有，不要删）
    include /etc/nginx/snippets/pep6-english-location.conf;

    # sunshinelife_ai_videos（新增）
    include /etc/nginx/snippets/sunshinelife_ai_videos.conf;

    # 根网站其它 location ...（保持不动）
    location / {
        ...
    }
}
```

**必须满足：**

- `include` 在 `server { }` **里面**，不能写在外面
- 不要新建第二个 `listen 80` 的 server 块
- 不要删除 `pep6-english-location.conf` 那一行

### 第 4 步：校验并重载

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 第 5 步：验证

```bash
curl -I http://127.0.0.1/english/
curl -I http://127.0.0.1/sunshinelife_ai_videos/
curl http://127.0.0.1/sunshinelife_ai_videos/api/health
```

---

## 排错

| 现象 | 原因 | 处理 |
|------|------|------|
| `nginx -t` 报 `include` 在 server 外 | include 写到了 `}` 后面 | 移进 `server { }` 内 |
| englishlearn 404 | 删了 pep6 include 或改错文件 | 恢复备份，只加新 include |
| 动画 502 | 后端未启动 | `pm2 status`，`pm2 restart sunshinelife-videos-api` |
| 动画页空白 | 未用子路径构建 | 重新运行 `install-subpath.sh` |

恢复备份：

```bash
sudo cp /etc/nginx/sites-enabled/default.bak.* /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```
