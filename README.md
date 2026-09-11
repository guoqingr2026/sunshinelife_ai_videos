# SunshineLife AI Videos (v1.0)

低成本网页端动画生产系统：Remotion + Manim + HyperFrames + Web 前端 + 后端渲染。

## 功能模块

- **字幕编辑** (`/editor/subtitle`) — 上传 SRT/TXT，自动断句修复
- **Manim 动画** (`/config/manim`) — PN结、能带结构等工程动画
- **HyperFrames** (`/config/hyperframes`) — AI 手绘帧动画生成
- **Remotion 合成** (`/config/remotion`) — 多模块时间轴、配色方案、模板保存
- **B站文案** (`/packaging/bilibili`) — 复制提示词，在 ChatGPT 等工具中手动生成
- **任务管理** (`/tasks`) — 查看渲染状态、下载视频

## 本地开发（Windows）

### 依赖

- Node.js 18+、pnpm
- Python 3.12+（Manim，可选）：`py -3.12 -m pip install manim` 或运行 `scripts\install_manim.bat`
- FFmpeg（HyperFrames，可选）
- Chrome（Remotion 渲染）

### 启动

```bash
pnpm install
cp .env.example .env   # 按需修改 Chrome 路径
```

双击 **`启动.bat`**，或：

```bash
pnpm dev
```

- 前端: http://localhost:3000
- 后端: http://localhost:3001

## 阿里云 ECS 部署

详见 **[deploy/ecs/README.md](deploy/ecs/README.md)**

```bash
# ECS 首次安装
sudo bash deploy/ecs/install.sh https://github.com/<你的用户名>/sunshinelife_ai_videos.git

# 日常更新
cd /opt/sunshinelife_ai_videos && sudo bash deploy/ecs/update.sh
```

## 项目结构

```
frontend/     Vite + React 前端
backend/      Express API + 任务队列 + JSON 存储
manim/        Python Manim 模板
remotion/     Remotion 合成模板
hyperframes/  AI 帧生成 + FFmpeg 合成
deploy/ecs/   阿里云 ECS 安装与更新脚本
```

## 版本

- **v1.0** — 初版：字幕、Manim、HyperFrames、Remotion（多模块/配色/模板）、B站文案、任务管理
