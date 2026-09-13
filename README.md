# SunshineLife AI Videos (v1.1)

低成本网页端动画生产系统：Remotion + Manim + HyperFrames + Web 前端 + 后端渲染。

**从主题到成片：** 请先阅读 **[docs/product-spec.md](docs/product-spec.md)**（产品规格书，含完整操作步骤）。

## 功能模块（推荐顺序）

1. **镜头规划** (`/config/shot-plan`) — GPT 分镜 JSON → 保存 → 发送到一键成片
2. **一键成片** (`/config/auto-video`) — 项目 JSON → Manim + Remotion → 导出工程包
3. **字幕编辑** (`/editor/subtitle`) — 上传 SRT/TXT，自动断句修复
4. **Manim** (`/config/manim`) — 单镜调试、能力索引、自定义 Python
5. **HyperFrames** (`/config/hyperframes`) — AI 手绘帧动画（需 API Key + ffmpeg）
6. **Remotion** (`/config/remotion`) — 手动时间轴、配色、模板保存
7. **B站文案** (`/packaging/bilibili`) — 复制提示词，在 ChatGPT 等工具中手动生成
8. **任务管理** (`/tasks`) — 查看渲染状态、下载视频
9. **提示词库** (`/config/prompts`) — 全流程模板提示词合集

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

## 文档

| 文档 | 说明 |
|------|------|
| [docs/product-spec.md](docs/product-spec.md) | **产品规格书**：从主题到完整动画的用户操作指南 |
| [docs/manim-automation-guide.md](docs/manim-automation-guide.md) | Manim 类型、params、API 技术手册 |

## 版本

- **v1.1** — 镜头规划 → 一键成片工作流、提示词库、HyperFrames 诊断、字体预设、output 工程包
- **v1.0** — 初版：字幕、Manim、HyperFrames、Remotion、B站文案、任务管理
