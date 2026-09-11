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

### 第 0 步：若 grep 为空，先跑诊断

`grep` 找不到 `pep6-english-location` **不代表没配 Nginx**，可能只是用了别的文件名或内联 `location /english`。

```bash
cd /opt/sunshinelife_ai_videos
sudo bash deploy/ecs/diagnose-nginx.sh
```

会自动生成 `/tmp/nginx-diagnose-*.txt`，把内容发来即可。

然后直接跑自动配置（已增强检测）：

```bash
sudo bash deploy/ecs/setup-nginx-subpath.sh
```

### 第 1 步：找到正确的配置文件

按优先级查找：

```bash
# A. englishlearn 官方 snippet
sudo grep -rn "pep6-english-location" /etc/nginx/

# B. 内联 /english（没写 snippet 文件名时）
sudo grep -rn "location.*/english" /etc/nginx/

# C. pep6 独立站点
ls -la /etc/nginx/sites-enabled/pep6-english

# D. 列出所有 80 端口站点
sudo grep -rn "listen 80" /etc/nginx/
```

**只改正在监听 80 端口的那一个 `server { }` 配置文件。**

> 常见错误：新建第二个 `listen 80` 的 server 块 —— 会与 englishlearn / 根网站冲突。

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
