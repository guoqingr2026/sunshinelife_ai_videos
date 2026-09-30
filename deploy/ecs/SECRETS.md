# ECS 密钥与安全（OpenRouter / IMAGE_API_KEY）

## 当前机制

- Key **只存在于服务器** ` /opt/sunshinelife_ai_videos/.env `，由 Node `dotenv` 加载，**不会**打进前端、不会出现在浏览器。
- 仓库 `.gitignore` 已忽略 `.env`，**切勿**把 Key 提交到 GitHub。
- `GET /api/video/shot-plan/llm-status` 只返回「是否已配置」，**不返回** Key。

## 明文 .env 在 ECS 上是否安全？

**相对安全的前提**（个人/小团队 ECS 常见做法）：

| 做法 | 说明 |
|------|------|
| 文件权限 | `chmod 600 .env`，属主为运行 PM2 的用户（如 `root` 或专用 `app`） |
| 不进 git | 只在服务器手工编辑或通过 SCP 下发 |
| 轮换 | Key 泄露或进过聊天/截图 → 在 OpenRouter 控制台立即撤销并换新 |
| 防火墙 | 安全组只开放 80/443；SSH 限制来源 IP |
| 额度上限 | OpenRouter 控制台设置 spend / rate limit |

**仍存在的风险**（明文 .env 无法消除）：

- 能 `ssh` 进机器的人能 `cat .env`
- 备份/快照若包含 `.env`，备份介质也要保护
- **公网可访问的** `POST /api/video/shot-plan/generate`：任何人可消耗你的 Key 额度（见下文）

加密 `.env` 里的值主要防：**误提交、备份泄露、运维误传**；**不能**防已登录 root 的用户（解密主密钥仍须在机器上）。

## 可选：加密配置（enc:v1）

1. 本机生成主密钥（只放在 ECS，不要进 git）：

   ```bash
   openssl rand -hex 32
   ```

2. 加密 OpenRouter Key：

   ```bash
   cd /opt/sunshinelife_ai_videos
   APP_SECRETS_KEY=<上一步64位hex> node scripts/encrypt-env-secret.mjs
   # 粘贴 sk-or-v1-... 或作为参数传入
   ```

3. ECS `.env` 示例：

   ```env
   APP_SECRETS_KEY=a1b2c3...   # 64 hex，chmod 600
   OPENROUTER_API_KEY=enc:v1:Base64...
   LLM_HTTP_PROXY=http://87.254.212.121:8080
   ```

4. `pm2 restart sunshinelife-videos-api`

仍支持明文：`OPENROUTER_API_KEY=sk-or-v1-...`（不推荐长期明文落盘）。

## 云厂商密钥管理（更安全）

若上生产、多人运维，建议：

- **阿里云 KMS / 凭据管家**：启动脚本拉取 Secret 注入环境变量，不落盘明文
- **PM2 `env` + 仅 root 可读** 的单独文件 `/etc/sunshinelife/secrets.env`

应用代码无需改，仍读 `process.env.OPENROUTER_API_KEY`。

## 必须知晓：AI 选题接口暴露面

`/api/video/shot-plan/generate` 目前**无登录校验**。站点公网可访问时，他人可能刷你的免费额度。

缓解（按优先级）：

1. Nginx 对该路径限流（`limit_req`）
2. 增加简单 `X-Internal-Token` 或仅内网调用（需改前端/网关）
3. OpenRouter 按 Key 设每日上限

后续可在产品里加「管理 Token」再调用生成接口。
