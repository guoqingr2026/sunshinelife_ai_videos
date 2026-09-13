# SunshineLife AI Videos — 产品规格书

> **文档版本：** v1.1（2026-09）  
> **适用代码：** `main` @ `9d706b7` 及之后  
> **在线地址（ECS）：** `http://47.99.184.249/sunshinelife_ai_videos/`

---

## 1. 产品定位

**低成本网页端动画生产系统**，面向科普、工程、学习类短视频创作者。用户只需一个**视频主题**，通过 Web 界面完成：

1. **分镜规划**（借助 ChatGPT / Claude 等外部 AI，手动复制提示词）
2. **一键成片**（Manim 内容动画 + Remotion 包装合成）
3. **发布辅助**（字幕、B 站文案、工程包下载）

核心理念：**Manim 负责「画面里动什么」，Remotion 负责「成片怎么包」**；HyperFrames 作为可选的 AI 手绘帧补充，不纳入主流水线必需步骤。

---

## 2. 功能模块一览

| 顺序 | 模块 | 路由 | 角色 |
|------|------|------|------|
| ① | **镜头规划** | `/config/shot-plan` | 从主题生成分镜 JSON，一键成片的**唯一上游** |
| ② | **一键成片** | `/config/auto-video` | 主流水线：Manim → Remotion → 导出工程包 |
| ③ | 字幕编辑 | `/editor/subtitle` | SRT/TXT 上传、断句；供 B 站文案使用 |
| ④ | Manim | `/config/manim` | 单镜头调试、能力索引、自定义 Python |
| ⑤ | HyperFrames | `/config/hyperframes` | AI 关键帧手绘动画（需 API Key + ffmpeg） |
| ⑥ | Remotion | `/config/remotion` | 手动编辑 timeline 并单独渲染 |
| ⑦ | B 站文案 | `/packaging/bilibili` | 标题 / 简介 / 钩子 / 封面文案 |
| ⑧ | 任务管理 | `/tasks` | 全部渲染任务状态与下载 |
| ⑨ | **提示词库** | `/config/prompts` | 全流程模板提示词合集（手动 → 未来 API） |

导航栏顺序即推荐操作顺序：**先规划，再成片，最后发布与排错**。

---

## 3. 从主题到完整动画：标准工作流

### 3.1 总览图

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│  视频主题    │ ──▶ │  镜头规划     │ ──▶ │  项目 JSON { title, shots[] }   │
│  (一句话)   │     │  + GPT 提示词  │     │  保存 → 发送到一键成片           │
└─────────────┘     └──────────────┘     └─────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│  下载成片    │ ◀── │  任务管理     │ ◀── │  一键成片                        │
│  MP4 + ZIP  │     │  查看进度     │     │  规划 → Manim → Remotion → 打包  │
└─────────────┘     └──────────────┘     └─────────────────────────────────┘
        │
        ▼
┌─────────────┐     ┌──────────────┐
│  字幕编辑    │ ──▶ │  B 站文案     │  （发布前可选）
└─────────────┘     └──────────────┘
```

### 3.2 阶段说明

| 阶段 | 用户输入 | 系统输出 | 预计耗时（参考） |
|------|----------|----------|------------------|
| 分镜规划 | 主题描述 + GPT 回复 | `shots[]` 镜头列表 | 5～15 分钟（人工 + AI） |
| 一键成片 | 项目 JSON | MP4 + `output` 工程 ZIP | 3～40 分钟（视 Manim 镜头数） |
| 发布包装 | 字幕 / 讲稿 | B 站标题、简介等文案 | 5 分钟 |

---

## 4. 逐步操作指南

### 步骤 1：镜头规划（必做）

**入口：** 顶部导航 → **镜头规划**

#### 4.1.1 准备主题

用一句话描述视频，例如：

- 「讲解 PN 结原理与载流子运动」
- 「艾宾浩斯遗忘曲线与间隔重复学习法」
- 「解方程 2^t = t^32」

#### 4.1.2 使用 GPT 生成分镜

1. 点击 **「复制 GPT 分镜提示词」**（完整版也可在 **提示词库** 查看）。
2. 打开 ChatGPT、Claude 等，粘贴提示词。
3. 追加你的主题，例如：

   ```
   请为以下主题规划 3～5 个镜头，输出 JSON 代码块：
   主题：PN 结的工作原理，面向大学生电子系入门。
   ```

4. AI 应返回如下结构的 JSON（三种粘贴方式均支持：markdown 代码块、纯 JSON、或文本规则 + 镜头序列）：

```json
{
  "rules": [
    { "keywords": ["pn结", "耗尽层"], "type": "pn_junction", "label": "PN 结" }
  ],
  "shots": [
    { "type": "chapter", "label": "开场" },
    { "type": "pn_junction", "label": "PN 结原理" },
    { "type": "band_structure", "label": "能带结构" },
    { "type": "bullet_list", "label": "小结", "params": { "title": "要点", "items": ["扩散", "漂移", "耗尽层"] } }
  ]
}
```

> **重要：** `shots` 数组是一键成片的**实际播放顺序**。`rules` 用于关键词匹配备用；若 `shots` 非空，成片**按 shots 顺序**，不再靠关键词自动匹配。

#### 4.1.3 保存规划

1. 将 GPT 输出粘贴到 **「规划文章」** 文本框。
2. 点击 **「预览解析」**，确认右侧显示镜头数量、无红色错误。
3. 点击 **「保存并生效」**。

#### 4.1.4 导出到一键成片

任选其一：

| 操作 | 说明 |
|------|------|
| **发送到一键成片 →** | 推荐。自动跳转一键成片页并填入项目 JSON |
| **导出项目 JSON** | 复制到剪贴板，可手动粘贴到一键成片 |
| API | `GET /api/video/shot-plan/project` 返回 `{ title, shots, projectJson }` |

**类型 ID 约束：** `type` 必须是系统已注册 ID。完整列表见镜头规划页右侧「全部 Manim 类型」表，或 `GET /api/video/shot-plan/spec`。勿使用 GPT 自造 ID（如 `memory_recall`），系统会自动映射部分别名，未知类型会导致成片失败。

---

### 步骤 2：一键成片（核心）

**入口：** 顶部导航 → **一键成片**

#### 4.2.1 确认项目 JSON

页面中央 **「项目 JSON」** 是唯一分镜来源。格式：

```json
{
  "title": "PN 结入门",
  "shots": [
    { "type": "pn_junction", "label": "PN 结原理" },
    { "type": "band_structure", "label": "能带结构" }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 建议 | 视频标题，用于工程包命名 |
| `shots` | ✅ | 有序镜头数组 |
| `shots[].type` | ✅ | Manim 或 Remotion 类型 ID |
| `shots[].label` | ✅ | 显示标题，建议 ≤12 字 |
| `shots[].params` | 否 | Manim 自定义参数，见 `docs/manim-automation-guide.md` |

从镜头规划跳转时，页顶会显示 **「已从镜头规划导入」**；若服务端有已保存规划但未跳转，可点 **「导入到项目 JSON」**。

**快速体验（跳过规划）：**

- **学习 MVP** — 内置遗忘曲线示例（约 5 镜）
- **数学题·快速版 / 完整版** — 指数方程示例（见 `examples/projects/math-2pow-t-equals-t32/`）

#### 4.2.2 预览与配置

1. **预览分镜**（可选）：调用规划 API，列出每个镜头的 `[manim]` / `[remotion]` 分类。
2. **字体预设**：影响 Remotion 成片与 Manim 中文字体（CJK）。
3. **预览模式**：更快、低分辨率，适合试跑。
4. **自动合成最终成片**：勾选后执行 Remotion 渲染；取消则只出 Manim 片段与时间轴 JSON。

#### 4.2.3 提交生成

点击 **「一键生成视频」**。系统后台执行：

```
排队 → 规划时间轴 → 批量 Manim 渲染 → 写入 timeline → Remotion 合成 → 打包 output 工程
```

右侧 **进度面板** 显示：阶段、百分比、Manim 进度 (n/m)、实时日志。

#### 4.2.4 获取成果

| 产物 | 获取方式 |
|------|----------|
| 成片 MP4 | 本页播放器 / **下载成片 MP4** |
| 工程包 ZIP | **下载 output 工程包 (.zip)** |
| 时间轴 JSON | 页面底部「Remotion 时间轴 JSON」折叠区 |

工程包目录结构（解压后）：

| 路径 | 内容 |
|------|------|
| `project.json` | 原始分镜，可再次粘贴到一键成片 |
| `timeline.json` | Remotion 合成时间轴 |
| `theme.json` | 配色主题 |
| `assets/final.mp4` | 最终成片 |
| `assets/manim/*.mp4` | 各 Manim 镜头素材 |
| `workflow.json` | 制作日志摘要 |
| `README.md` | 人类可读说明 |

---

### 步骤 3：任务管理（监控与下载）

**入口：** **任务管理**

- 按类型筛选：`compose` / `manim` / `remotion` / `hyperframes`
- 状态：`pending` → `running` → `success` / `failed`
- 失败时查看 **error** 字段（Manim 未安装、类型无效、Remotion 超时等）
- Worker 每 **2 秒** 轮询一条 pending 任务，多任务依次排队

---

### 步骤 4：字幕与 B 站文案（发布前可选）

#### 字幕编辑

1. **字幕编辑** → 上传 SRT/TXT 或粘贴文本 → 保存。
2. 字幕进入系统库，供 B 站文案页下拉选择。

#### B 站文案

1. **B 站文案** → 选择字幕或粘贴讲稿。
2. 复制提示词到 AI → 获得标题、简介、前 3 秒钩子、封面大字/小字。
3. 将 AI 回复贴回本页本地记录（当前不持久化到服务器）。

---

## 5. 扩展能力（非主路径）

以下模块**不经过**一键成片主流水线，用于单镜调试或特殊素材。

### 5.1 Manim 单镜调试

**场景：** 验证某个模板参数、测试 `custom_python`、查看 Manim 环境是否就绪。

1. **Manim** → 能力索引选类型 → 填 `params` JSON → 提交。
2. `GET /api/manim/status` 可查看 `manimInstalled` / `mode: real|placeholder`。
3. 成片在一键成片时会**自动批量**提交 Manim，通常无需单独操作。

### 5.2 HyperFrames（AI 手绘帧）

**场景：** 光耦、手绘示意图等 Manim 模板难以表达的镜头。

**前置条件：**

| 依赖 | 环境变量 / 安装 | 缺失时表现 |
|------|-----------------|------------|
| 图像 API | `IMAGE_API_KEY` 或 `OPENAI_API_KEY` | 8×8 占位图，画面不可见 |
| ffmpeg | `apt install -y ffmpeg` | 仅有帧目录，无 MP4 |

页顶 **环境检测** 调用 `GET /api/hyperframes/status`。配置后 `pm2 restart sunshinelife-videos-api`。

> HyperFrames 产出目前需**手动**插入 Remotion timeline（`hyperframes_clip`），未与一键成片自动串联。

### 5.3 Remotion 手动合成

**场景：** 精细调整转场、时长、配色，不重新跑 Manim。

1. **Remotion** → 选模板与配色 → 编辑 timeline JSON → 提交渲染。
2. 一键成片成功后，也可从工程包 `timeline.json` 修改后再到此页渲染。

---

## 6. 提示词库与自动化路线

**入口：** **提示词库** (`/config/prompts`)

按 8 步流水线整理每步的：

- 操作说明
- **复制提示词** 按钮
- **AI 回复** 粘贴区（浏览器本地，刷新丢失）

| 阶段 | 当前 | 规划 |
|------|------|------|
| 分镜规划 | 手动复制 GPT 提示词 | 后端 LLM API 自动生成并保存 |
| 一键成片 | 手动确认 JSON | brief 已弃用，以 `project.shots` 为准 |
| 字幕 | 手动上传 | Whisper API 转写 |
| B 站文案 | 手动复制提示词 | 包装 API 直连 LLM |
| HyperFrames | 手动提交 | 与分镜 JSON 类型 `hyperframes` 联动（待开发） |

---

## 7. 数据规格

### 7.1 项目 JSON（一键成片输入）

```typescript
interface VideoProject {
  title?: string;
  shots: Array<{
    type: string;      // Manim 或 Remotion 类型 ID
    label: string;     // 显示标题
    params?: object;   // 可选，Manim 模板参数
  }>;
}
```

### 7.2 镜头规划存储

- 路径：`backend/storage/shot-plan.json`
- 结构：`{ article, rules, shots, updatedAt }`
- 导出 API：`GET /api/video/shot-plan/project`

### 7.3 Remotion 镜头类型（非 Manim）

`title`, `chapter`, `bullet_list`, `fade_text`, `subtitle`, `quote`, `flow_steps`, `timeline_bar`, `formula_card`, `compare`, `arrow`, `stat`, `params`

### 7.4 Manim 镜头类型

约 **42+** 种注册模板，分域：

| 域 | 示例 type |
|----|-----------|
| 工程 / 半导体 | `pn_junction`, `band_structure`, `mosfet_channel`, `buck_converter` |
| 数学 | `function_graph`, `mathtex_formula`, `mathtex_derivation` |
| 学习 / 科普 | `forgetting_curve`, `concept_network`, `typewriter_text`, `learning_curve` |
| 英语 | `vocab_card`, `grammar_highlight`, `dialogue_scene` |
| 媒体 / 3D | `image_focus`, `scene_3d_surface`（3D 需 OpenGL，ECS 慎用） |

完整参数见 **`docs/manim-automation-guide.md`**。

### 7.5 自定义 ECS 镜头类型（非 Remotion/Manim 内置）

本系统的「镜头类型」是**在 ECS 中注册的组件 ID**，不是 Remotion 或 Manim 引擎自带名称。GPT 可输出自定义 ID，但必须在代码中完成注册后方能使用。

**已内置的蒙提霍尔专题镜头：**

| type | 引擎 | 说明 |
|------|------|------|
| `remotion_doors` | Remotion | 三扇门场景（title / doors / subtitle） |
| `remotion_open_door` | Remotion | 主持人开门（selectedDoor / openedDoor / reveal / text） |
| `remotion_car_reveal` | Remotion | 汽车揭示（door / effect / text） |
| `manim_probability_tree` | Manim | 概率树状图（branches / highlight） |
| `manim_formula` | Manim | 公式 + 分步推导（formula / steps） |
| `manim_simulation_chart` | Manim | 模拟收敛曲线（targetValue / description） |

示例 JSON：`examples/projects/monty-hall/project.json`；一键成片页可点 **「蒙提霍尔」** 快速加载。

**新增自定义镜头需同步 5 处：** `shot-plan-spec.ts` → `plan-timeline.ts` → Remotion 组件 + `SimpleElectric.tsx` switch（或 Manim 模板 + `template_catalog.py`）→ `manim-capabilities.ts` → `auto-video.tsx` 类型校验 Set。

---

## 8. 系统架构（技术规格摘要）

```
┌──────────────┐     HTTP      ┌──────────────┐     轮询      ┌──────────────┐
│  React 前端   │ ◀──────────▶ │ Express API  │ ◀──────────▶ │ Task Worker  │
│  Vite 构建    │              │  JSON 存储    │   2s/任务    │  单线程队列   │
└──────────────┘              └──────────────┘              └──────┬───────┘
                                                                  │
                    ┌─────────────────┬─────────────────┬──────────┴──────────┐
                    ▼                 ▼                 ▼                     ▼
              Manim (Python)    Remotion (Chrome)   HyperFrames          output-bundle
              模板渲染 .mp4      时间轴合成 .mp4      DALL·E + ffmpeg      ZIP 工程包
```

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Vite + Tailwind | 子路径部署 `VITE_BASE_PATH` |
| 后端 | Express + 内存/JSON DB | 端口 3001（本地）/ 3012（ECS 子路径） |
| Manim | Python 3.12 + manim | 未安装时占位视频 |
| Remotion | Node + Chrome | `REMOTION_BROWSER_EXECUTABLE` |
| HyperFrames | OpenAI 兼容图像 API + ffmpeg | 可选模块 |
| 部署 | Nginx + PM2 | 见 `deploy/ecs/README.md` |

---

## 9. 环境依赖清单

### 9.1 一键成片最低要求

| 依赖 | 用途 | 未安装时 |
|------|------|----------|
| Node.js 18+ | 前后端 | 无法运行 |
| pnpm | 包管理 | 无法构建 |
| Chrome | Remotion 渲染 | 合成失败 |
| Python + manim | 真实 Manim 动画 | 占位视频（仍可走通流程） |

### 9.2 HyperFrames 额外要求

| 依赖 | 用途 |
|------|------|
| `IMAGE_API_KEY` / `OPENAI_API_KEY` | 真实 AI 绘图 |
| ffmpeg | 帧序列 → MP4 |
| `IMAGE_MODEL`（默认 `dall-e-3`） | 模型选择 |

### 9.3 画质增强（可选）

| 依赖 | 用途 | 安装 |
|------|------|------|
| texlive | MathTex 公式清晰 | `deploy/ecs/install-texlive-optional.sh` |
| Noto Sans CJK | Manim 中文 | ECS install 脚本已含 |

### 9.4 环境变量（`.env`）

```bash
PORT=3001
STORAGE_PATH=./storage
REMOTION_BROWSER_EXECUTABLE=C:\Program Files\Google\Chrome\Application\chrome.exe
# HyperFrames（可选）
IMAGE_API_KEY=sk-...
IMAGE_MODEL=dall-e-3
```

---

## 10. 完整示例：从主题到发布

### 示例 A：学习科普「遗忘曲线」（新手推荐）

| 步 | 操作 |
|----|------|
| 1 | 镜头规划 → 复制 GPT 提示词 → 主题：「艾宾浩斯遗忘曲线与间隔重复」 |
| 2 | 保存 GPT 返回的 JSON（含 `forgetting_curve`, `typewriter_text`, `chapter` 等） |
| 3 | **发送到一键成片** |
| 4 | 选字体预设 → 勾选预览模式先试跑 → 再正式生成 |
| 5 | 下载 MP4 + 工程包 |
| 6 | （可选）字幕编辑录入讲稿 → B 站文案生成标题简介 |

或跳过 1～3：一键成片页点 **「学习 MVP」** 直接体验。

### 示例 B：数学题「2^t = t^32」

| 步 | 操作 |
|----|------|
| 1 | 一键成片 → **数学题·快速版**（或完整版） |
| 2 | 参考 `examples/projects/math-2pow-t-equals-t32/narration-zh.md` 录制旁白 |
| 3 | 使用 `subtitles-zh.srt` 导入剪辑软件对齐成片 |
| 4 | ECS 建议安装 texlive 以清晰显示公式 |

### 示例 C：半导体「PN 结」

| 步 | 操作 |
|----|------|
| 1 | 镜头规划 → GPT 输出 `pn_junction` → `band_structure` → `current_arrow` 序列 |
| 2 | 发送到一键成片 → 预览分镜确认 3 个 Manim |
| 3 | 生成 → 任务管理查看 Manim 逐镜进度 |
| 4 | B 站文案 → 工程科普风格 |

---

## 11. 常见问题排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 一键成片提交失败 | API 未启动 / 前端未 rebuild | `pm2 status`；ECS 执行 `fix-white-screen.sh` |
| 未知镜头类型 | GPT 使用了未注册 type | 对照镜头规划类型表修正 JSON |
| Manim 很快完成但画面空白 | manim 未安装 | `scripts/install_manim.bat` 或 ECS install |
| 进度卡在 Manim 很久 | 镜头过多（>8） | 用快速版示例或减少 shots |
| HyperFrames 成功但无画面 | 无 IMAGE_API_KEY | 配置 `.env` 后 restart |
| HyperFrames 无 MP4 | 无 ffmpeg | `apt install -y ffmpeg` |
| Remotion 失败 | Chrome 路径错误 | 检查 `REMOTION_BROWSER_EXECUTABLE` |
| 白屏 | 前端 base path 不匹配 | `VITE_BASE_PATH=/sunshinelife_ai_videos/` 重新 build |

诊断脚本（ECS）：

```bash
sudo bash deploy/ecs/fix-white-screen.sh
sudo bash deploy/ecs/diagnose-compose.sh   # 若存在
pm2 logs sunshinelife-videos-api
```

---

## 12. API 快速参考

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/video/shot-plan/spec` | GPT 提示词 + 类型表 |
| GET/POST | `/api/video/shot-plan` | 读取/保存规划文章 |
| GET | `/api/video/shot-plan/project` | 导出成片项目 JSON |
| POST | `/api/video/plan` | 预览时间轴（不渲染） |
| POST | `/api/video/compose` | 提交一键成片任务 |
| GET | `/api/video/compose/:id` | 轮询进度 |
| GET | `/api/video/compose/:id/bundle` | 下载工程 ZIP |
| GET | `/api/hyperframes/status` | HyperFrames 环境检测 |
| GET | `/api/manim/status` | Manim 环境检测 |
| GET | `/api/tasks` | 任务列表 |

---

## 13. 相关文档

| 文档 | 内容 |
|------|------|
| [README.md](../README.md) | 安装与快速启动 |
| [manim-automation-guide.md](./manim-automation-guide.md) | Manim 类型、params、API 详解 |
| [deploy/ecs/README.md](../deploy/ecs/README.md) | 阿里云 ECS 部署 |
| [examples/projects/math-2pow-t-equals-t32/](../examples/projects/math-2pow-t-equals-t32/) | 数学题完整示例工程 |

---

## 14. 版本记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-03 | 字幕、Manim、HyperFrames、Remotion、B 站文案、任务管理 |
| v1.1 | 2026-09 | 镜头规划 → 一键成片衔接；提示词库；HyperFrames 环境检测；导航工作流重排；字体预设；output 工程包自动导出 |

---

*本文档描述的是面向**最终用户**的操作规格。开发实现细节以仓库源码为准。*
