# SunshineLife AI Videos — 产品规格书

> **文档版本：** v1.3（2026-09）  
> **适用代码：** `main` @ `ed9a8bf` 及之后  
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
| ⑧ | 任务管理 | `/tasks` | 全部渲染任务状态与下载；**本地归档**（浏览器选文件夹保存 ZIP/MP4） |
| ⑨ | **提示词库** | `/config/prompts` | 全流程模板提示词合集（手动 → 未来 API） |

页脚 **站点门户**（`frontend/utils/site-portal.ts`）可跳转：ECS 根站、英语学习 `/english/`、本系统、Manim 官方文档。

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

**类型 ID 约束：** `type` 必须是系统已注册 ID。完整列表见本文 **§7.4–7.6**、镜头规划页「全部 Manim 类型」表，或 `GET /api/video/shot-plan/spec`。勿使用 GPT 自造 ID；部分别名会自动映射（§7.5 别名表），未知类型会导致成片失败。

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
- **蒙提霍尔** — Remotion 三门 + Manim 概率树示例
- **数学宇宙** — `manim_custom` 多曲线镜头
- **读书训练** — 10 个学习方法 + 数学曲线隐喻（见 `examples/projects/reading-study/`）

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
- **本地归档**（Chrome/Edge）：选择本机文件夹 → 将成片 ZIP / MP4 写入该目录；可选「归档后删除服务器素材」。无文件夹权限时回退为浏览器下载。详见 `docs/local-archive-and-baidu.md`
- Windows 批量同步：`scripts/sync-ecs-to-local.ps1`（从 ECS 拉取任务产物，不依赖浏览器 File System API）

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

- **能力索引**：按领域浏览全部已注册 `type` 与默认 `params`
- **示例画廊**：展示 `scene_examples.json` + `official_custom_examples.json` 全部条目；一键应用到任务或复制为 `custom_python` JSON
- **官方示例**：已内置 6 个 [Manim Example Gallery](https://docs.manim.community/en/stable/examples.html) 片段（`SquareToCircle`、`VectorArrow`、`BraceAnnotation`、`HarmonicRibbon3D` 等），见 §7.9

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
  theme?: ThemeConfig;
  autoWrap?: boolean;   // 默认 false：严格按 shots 顺序，不自动加片头片尾
  shots: Array<{
    type: string;              // Manim 或 Remotion 类型 ID（见 §7.3–7.6）
    label: string;             // 显示标题
    params?: object;           // Manim / Remotion 参数
    durationSeconds?: number;  // 成片占用秒数（30fps，与 durationInFrames 二选一）
    durationInFrames?: number; // 成片占用帧数（默认 Manim 槽位 150 帧 ≈ 5s）
  }>;
}
```

Manim 内部停留（绘制/旋转）与成片槽位独立，常用 `params` 字段：`hold_seconds`、`rotate_seconds`、`curve_run_time`、`intro_run_time`、`tail_wait`（见 `manim/templates/math_universe/_base.py`）。

### 7.2 镜头规划存储

- 路径：`backend/storage/shot-plan.json`
- 结构：`{ article, rules, shots, updatedAt }`
- 导出 API：`GET /api/video/shot-plan/project`
- 类型表 API：`GET /api/video/shot-plan/spec`（含 GPT 提示词）
- Manim 宇宙场景：`GET /api/manim/universe-scenes`
- 示例库：`GET /api/manim/examples`（`manim/scene_examples.json`）

### 7.3 成片流水线：ID 如何映射

```
shots[].type
    │
    ├─ resolveManimType() 命中 ──▶ Manim 渲染任务 (type = 规范 ID)
    │         │                      render_task.py → template_catalog / manim_custom
    │         ▼
    │    timeline: manim_placeholder → (渲染后) manim_clip + sourceUrl
    │
    └─ resolveRemotionType() 命中 ─▶ timeline: 同名 Remotion 组件（不经 Manim）
```

| 阶段 | timeline `type` | 来源 | 说明 |
|------|-----------------|------|------|
| 规划后（Manim 未渲染） | `manim_placeholder` | `plan-timeline.ts` | 占位，`manimType` = 规范 Manim ID |
| Manim 完成后 | `manim_clip` | `compose.ts` | 嵌入 MP4，`manimType` 保留溯源 |
| Remotion 包装镜 | 与 `shots[].type` 相同 | `plan-timeline.ts` | 如 `chapter`、`bullet_list` |
| 仅手动 timeline | `device_toggle`、`hyperframes_clip` 等 | Remotion 页 / 工程包 | **不在** `resolveRemotionType`，不能写在 `shots` 里 |

**默认帧长（30fps）：** Manim 槽位 **150 帧**；`title` 120；`chapter` 90；`quote` 100；`fade_text` 90。可通过镜头级 `durationSeconds` / `params.durationSeconds` 覆盖。

### 7.4 Remotion 包装类型（`shots[].type` 可直接使用）

共 **16** 种，经 `resolveRemotionType()` 识别，由 `remotion/src/compositions/SimpleElectric.tsx` 渲染。

| ID | 中文 | 默认帧 | 主要字段 / `params` |
|----|------|--------|---------------------|
| `title` | 标题 | 120 | `title` |
| `chapter` | 章节 | 90 | `title` |
| `params` | 键值参数 | 120 | `params: { 键: 值 }` |
| `bullet_list` | 要点列表 | 150 | `title`, `items[]` |
| `subtitle` | 底部字幕条 | 120 | `text` |
| `fade_text` | 淡入文字 | 90 | `text` |
| `compare` | 左右对比 | 120 | `leftTitle`, `rightTitle`, `leftText`, `rightText` |
| `arrow` | 流程箭头 | 90 | — |
| `quote` | 引用卡 | 100 | `quote`, `author` |
| `stat` | 数据高亮 | 90 | `value`, `label` |
| `flow_steps` | 流程步骤 | 150 | `steps[]` |
| `timeline_bar` | 时间轴条 | 150 | `title`, `events[]` |
| `formula_card` | 公式卡 | 120 | `formula`, `caption` |
| `remotion_doors` | 三扇门 | 150 | `params.title`, `params.subtitle`, `params.doors[]` |
| `remotion_open_door` | 开门揭示 | 150 | `params.selectedDoor`, `openedDoor`, `reveal`, `text` |
| `remotion_car_reveal` | 汽车揭示 | 150 | `params.door`, `effect`, `text` |

**Remotion 别名（`REMOTION_TYPE_ALIASES` → 规范 ID）：**

| 别名 | → 规范 ID |
|------|-----------|
| `cornell_notes`, `cornell`, `notes` | `bullet_list` |
| `subtitle` | `subtitle` |
| `quote` | `quote` |
| `title_card`, `title` | `title` |
| `outro`, `manim_clip` | `fade_text` |

**仅 Remotion 手动 timeline（勿写入 `shots`）：** `device_toggle`、`manim_clip`、`hyperframes_clip`、`manim_placeholder`、`hyperframes_placeholder`。

### 7.5 Manim 内容动画类型（`shots[].type` 可直接使用）

共 **75** 种，经 `resolveManimType()` 识别；其中 **74** 种在 `manim/template_catalog.py` 有 Python 模板，`custom_python` 另走代码粘贴（仍计入镜头规划类型表）。

#### 7.5.1 工程 / 物理 / 电气（9）

| ID | 中文 |
|----|------|
| `pn_junction` | PN 结 |
| `band_structure` | 能带结构 |
| `current_arrow` | 电路电流 |
| `photon_breakdown` | 光子激发 |
| `semiconductor_layers` | 半导体层 |
| `mosfet_channel` | MOSFET |
| `buck_converter` | Buck 拓扑 |
| `sine_waveform` | 正弦波形 |
| `llc_resonant` | LLC 谐振 |

#### 7.5.2 数学 / 几何 / 图表（8）

| ID | 中文 |
|----|------|
| `function_graph` | 函数曲线 |
| `coordinate_grid` | 坐标系 |
| `vector_sum` | 向量合成 |
| `bar_chart` | 数据统计 |
| `pie_chart` | 饼图 |
| `line_chart_compare` | 折线对比 |
| `manim_probability_tree` | 概率树状图 |
| `manim_simulation_chart` | 模拟实验图 |

#### 7.5.3 信息图表 / 学习科普（5）

| ID | 中文 |
|----|------|
| `timeline_horizontal` | 时间轴 |
| `flowchart` | 流程图 |
| `forgetting_curve` | 遗忘曲线 |
| `concept_network` | 概念网络 |
| `learning_curve` | 学习效率 |

#### 7.5.4 文本动画（5）

| ID | 中文 |
|----|------|
| `typewriter_text` | 逐字出现 |
| `keyword_pop` | 关键词高亮 |
| `formula_steps` | 公式拆解 |
| `chapter_banner` | 章节横幅 |
| `code_highlight` | 代码高亮 |

#### 7.5.5 结构 / 轨道（7）

| ID | 中文 |
|----|------|
| `isometric_stack` | 层叠结构 |
| `orbit_paths` | 轨道路径 |
| `circuit_loop` | 电路回路 |
| `band_temperature` | 能带温度 |
| `crystal_lattice` | 晶体点阵 |
| `transform_demo` | 变换动画 |
| `manim_formula` | 公式推导卡 |

#### 7.5.6 英语学习（3）

| ID | 中文 |
|----|------|
| `vocab_card` | 单词卡 |
| `grammar_highlight` | 语法高亮 |
| `dialogue_scene` | 对话场景 |

#### 7.5.7 媒体 / 公式 / 3D（7）

| ID | 中文 | OpenGL |
|----|------|--------|
| `mathtex_formula` | MathTex 公式 | 否 |
| `mathtex_derivation` | 公式推导 | 否 |
| `scene_3d_surface` | 3D 曲面 | **是** |
| `scene_3d_orbit` | 3D 轨道 | **是** |
| `image_focus` | 图片聚焦 | 否 |
| `svg_icon` | SVG 图标 | 否 |
| `video_embed` | 视频嵌入 | 否 |

#### 7.5.8 数学曲线（直注册 `type`，9）

| ID | 中文 | OpenGL |
|----|------|--------|
| `manim_cardioid` | 心形线 | 否 |
| `manim_rose_curve` | 玫瑰线 | 否 |
| `manim_archimedean_spiral` | 阿基米德螺线 | 否 |
| `manim_exponential_spiral` | 指数螺线 | 否 |
| `manim_lemniscate` | 莱姆尼斯盖特 | 否 |
| `manim_cycloid` | 摆线 | 否 |
| `manim_lissajous` | 李萨如图形 | 否 |
| `manim_lorenz_attractor` | 洛伦兹吸引子 | **是** |
| `manim_mandelbrot_zoom` | 曼德布罗集 | 否 |

#### 7.5.9 数学宇宙快捷 `type`（7）

与 §7.6 宇宙场景等价，但 `type` 已固定，无需写 `params.scene`：

| `shots[].type` | 默认宇宙场景类 |
|----------------|----------------|
| `manim_curve_3d` | `Curve3DScene` |
| `manim_parametric_surface` | `SurfaceScene` |
| `manim_parametric_curve` | `ParametricCurveScene` |
| `manim_rossler` | `RosslerScene` |
| `manim_julia_set` | `JuliaScene` |
| `manim_koch_snowflake` | `KochSnowflakeScene` |
| `manim_three_body` | `ThreeBodyScene` |

#### 7.5.10 读书 / 学习方法专题（10）

| ID | 中文 |
|----|------|
| `manim_outline` | 大纲结构图 |
| `manim_teacher_resources` | 老师资源图 |
| `manim_draw_diagram` | 结构绘制 |
| `manim_compare_table` | 左右对比表 |
| `manim_vocabulary_focus` | 单字放大 |
| `manim_multi_explanation` | 多人解释 |
| `manim_explanation_highlight` | 详解高亮 |
| `manim_recall_page` | 翻页复述 |
| `manim_phone_fade` | 手机淡出 |
| `manim_keybook` | 考前重点本 |

示例：`examples/projects/reading-study/project.json`；一键成片 **「读书训练」** 按钮（约 50 镜，含 `typewriter_text`、`chapter` 与数学曲线隐喻）。

#### 7.5.11 官方画廊精选（2）

| ID | 中文 | 说明 |
|----|------|------|
| `manim_moving_frame_box` | 公式框选 | 官方 MovingFrameBox：分段 `MathTex` + `SurroundingRectangle` 切换（**建议 texlive**） |
| `manim_point_with_trace` | 动点轨迹 | 官方 PointWithTrace：`mode=demo` 旋转留痕；`mode=parametric` + `x(t),y(t)` 动态绘曲线 |

示例见 `manim/scene_examples.json`（Manim 页画廊 →「官方画廊精选」）。

#### 7.5.12 高级 / 自定义（4）

| ID | 说明 |
|----|------|
| `manim_custom` | **推荐**：`params.scene` 指定宇宙场景名（§7.6），一个 `type` 覆盖全部宇宙镜头 |
| `custom_python` | `params.code` 粘贴完整 Manim `Scene` 类（**覆盖官方画廊任意示例**，见 §7.9） |
| `custom_dsl` | `params` JSON DSL 场景 |
| `formula_curve` | 输入 `x(t)` / `y(t)` / `r(t)` 公式生成参数曲线 |

**Manim 镜头别名（`MANIM_TYPE_ALIASES` → 规范 ID）：**

| 别名 | → 规范 ID |
|------|-----------|
| `memory_recall`, `neural_connection`, `feynman`, `feynman_technique`, `knowledge_tree`, `mind_map`, `concept_tree`, `study_group` | `concept_network` |
| `active_recall`, `learning_tips` | `typewriter_text` |
| `concept_simplify` | `formula_steps` |
| `spaced_repetition`, `ebbinghaus`, `spaced_repetition_curve` | `forgetting_curve` |
| `interleave` | `flowchart` |
| `deep_work` | `keyword_pop` |
| `exam_simulation` | `timeline_horizontal` |
| `brain_health` | `learning_curve` |
| `vocabulary`, `vocab` | `vocab_card` |
| `grammar` | `grammar_highlight` |
| `dialogue`, `conversation` | `dialogue_scene` |
| `mathtex`, `latex_formula` | `mathtex_formula` |
| `derivation`, `formula_derivation` | `mathtex_derivation` |
| `3d_surface`, `three_d` | `scene_3d_surface` |
| `3d_orbit` | `scene_3d_orbit` |
| `image`, `picture` | `image_focus` |
| `svg` | `svg_icon` |
| `video_clip` | `video_embed` |
| `cardioid` | `manim_cardioid` |
| `rose_curve` | `manim_rose_curve` |
| `archimedean_spiral` | `manim_archimedean_spiral` |
| `exponential_spiral` | `manim_exponential_spiral` |
| `lemniscate` | `manim_lemniscate` |
| `cycloid` | `manim_cycloid` |
| `lissajous` | `manim_lissajous` |
| `lorenz_attractor` | `manim_lorenz_attractor` |
| `mandelbrot`, `mandelbrot_zoom` | `manim_mandelbrot_zoom` |
| `custom_scene`, `universe_scene` | `manim_custom` |
| `julia_set` | `manim_julia_set` |
| `koch_snowflake` | `manim_koch_snowflake` |
| `three_body` | `manim_three_body` |
| `curve_3d` | `manim_curve_3d` |
| `rossler` | `manim_rossler` |
| `parametric_surface` | `manim_parametric_surface` |
| `parametric_curve` | `manim_parametric_curve` |

完整 `params` 说明见 **`docs/manim-automation-guide.md`**；前端能力表见 `frontend/utils/manim-capabilities.ts`。

### 7.6 数学宇宙场景（`manim_custom` + `params.scene`）

`type: "manim_custom"` 时，**必填** `params.scene`（或别名，见下表「scene 别名」）。注册表：`manim/templates/math_universe/registry.py`；分发：`manim/render_task.py`。

共 **33** 个规范场景名：

#### 2D 曲线（`curve_2d`，10）

| `params.scene` | 中文 | OpenGL |
|----------------|------|--------|
| `ParametricCurveScene` | 通用参数曲线 | 否 |
| `RoseCurveScene` | 玫瑰线 | 否 |
| `CardioidScene` | 心形线 | 否 |
| `ArchimedeanSpiralScene` | 阿基米德螺线 | 否 |
| `EpicycloidScene` | 外摆线 | 否 |
| `LissajousScene` | 李萨如 2D | 否 |
| `SpirographScene` | 万花筒 / Spirograph | 否 |
| `HarmonicCurveScene` | 谐波叠加 2D | 否 |
| `IteratedFlowerScene` | 迭代花朵 | 否 |
| `ComplexCurveScene` | 复平面曲线 | 否 |

#### 3D 曲线 / 曲面（`curve_3d` + `surfaces`，7）

| `params.scene` | 中文 | OpenGL |
|----------------|------|--------|
| `Curve3DScene` | 3D 螺旋曲线 | **是** |
| `Lissajous3DScene` | 3D 李萨如 | **是** |
| `Harmonic3DScene` | 3D 谐波曲线 | **是** |
| `HarmonicRibbon3D` | 3D 谐波光带 | **是** |
| `SpiralFlower3D` | 3D 螺旋花 | **是** |
| `SurfaceScene` | 参数曲面 | **是** |
| `SaddleSurfaceScene` | 马鞍面 | **是** |

#### 混沌（`chaos`，3）

| `params.scene` | 中文 | OpenGL |
|----------------|------|--------|
| `LorenzScene` | 洛伦兹吸引子（支持 `n` 条彩色轨迹） | **是** |
| `ColorLorenz3D` | 渐变洛伦兹光轨 | **是** |
| `RosslerScene` | Rössler 吸引子 | **是** |

#### 分形（`fractals`，3）

| `params.scene` | 中文 | OpenGL |
|----------------|------|--------|
| `MandelbrotScene` | 曼德布罗集 | 否 |
| `JuliaScene` | 朱利亚集 | 否 |
| `KochSnowflakeScene` | Koch 雪花 | 否 |

#### 动力学（`dynamics`，1）

| `params.scene` | 中文 | OpenGL |
|----------------|------|--------|
| `ThreeBodyScene` | 三体问题 | 否 |

#### 兼容 `math_curves` 直调（9）

与 §7.5.8 直注册 `type` 画面相同，也可写在 `manim_custom.params.scene`：

`ManimCardioid`, `ManimRoseCurve`, `ManimArchimedeanSpiral`, `ManimExponentialSpiral`, `ManimLemniscate`, `ManimCycloid`, `ManimLissajous`, `ManimLorenzAttractor`, `ManimMandelbrotZoom`

**`params.scene` 别名（`SCENE_ALIASES` → 规范 scene 名）：**

| 别名 | → 规范 scene |
|------|----------------|
| `parametric_curve` | `ParametricCurveScene` |
| `rose_curve` | `RoseCurveScene` |
| `cardioid` | `CardioidScene` |
| `archimedean_spiral` | `ArchimedeanSpiralScene` |
| `epicycloid` | `EpicycloidScene` |
| `lissajous` | `LissajousScene` |
| `spirograph` | `SpirographScene` |
| `harmonic_curve`, `harmonic_2d` | `HarmonicCurveScene` |
| `iterated_flower` | `IteratedFlowerScene` |
| `complex_curve` | `ComplexCurveScene` |
| `curve_3d` | `Curve3DScene` |
| `lissajous_3d` | `Lissajous3DScene` |
| `harmonic_3d` | `Harmonic3DScene` |
| `harmonic_ribbon_3d` | `HarmonicRibbon3D` |
| `spiral_flower_3d` | `SpiralFlower3D` |
| `surface` | `SurfaceScene` |
| `saddle_surface` | `SaddleSurfaceScene` |
| `lorenz`, `lorenz_attractor` | `LorenzScene` |
| `color_lorenz_3d` | `ColorLorenz3D` |
| `rossler` | `RosslerScene` |
| `mandelbrot` | `MandelbrotScene` |
| `julia`, `julia_set` | `JuliaScene` |
| `koch`, `koch_snowflake` | `KochSnowflakeScene` |
| `three_body` | `ThreeBodyScene` |
| `manim_cardioid` … `manim_mandelbrot_zoom` | 同名 `Manim*` 类 |

**示例（加长洛伦兹）：**

```json
{
  "type": "manim_custom",
  "label": "洛伦兹·5条彩色",
  "durationSeconds": 16,
  "params": {
    "scene": "LorenzScene",
    "title": "洛伦兹吸引子",
    "n": 5,
    "colors": ["#e85d75", "#4a90d9", "#50c878", "#f5a623", "#9b59b6"],
    "hold_seconds": 8,
    "rotate_seconds": 8
  }
}
```

### 7.7 `type` → Python 模板映射（Manim 渲染层）

一键成片 Manim 任务最终调用 `POST` 内部 `renderManim({ type, params })` → `manim/render_task.py`：

| `type` 分支 | Python 入口 |
|-------------|-------------|
| `manim_custom` | `resolve_universe_scene(params.scene)` → `math_universe/*.py` |
| `custom_python` | `params.code` 临时 Scene 文件 |
| 其余已注册 `type` | `template_catalog.TEMPLATES[type]` → `manim/templates/*.py` |

### 7.8 蒙提霍尔专题（示例工程）

| `shots[].type` | 引擎 | 说明 |
|----------------|------|------|
| `remotion_doors` | Remotion | 三扇门 |
| `remotion_open_door` | Remotion | 开门揭示 |
| `remotion_car_reveal` | Remotion | 汽车揭示 |
| `manim_probability_tree` | Manim | 概率树 |
| `manim_formula` | Manim | 公式卡 |
| `manim_simulation_chart` | Manim | 收敛曲线 |

示例：`examples/projects/monty-hall/project.json`；一键成片 **「蒙提霍尔」** 按钮。

**新增自定义镜头需同步：** `shot-plan-spec.ts` → `plan-timeline.ts` → `SimpleElectric.tsx`（Remotion）或 `template_catalog.py` + 模板文件（Manim）→ `manim-capabilities.ts` →（可选）`scene_examples.json`。

### 7.9 与 Manim 官方 Example Gallery 的对应关系

官方画廊：[Manim Community — Example Gallery](https://docs.manim.community/en/stable/examples.html)（v0.21，约 **26** 个独立示例，分 5 类）。

**结论（先读这句）：**

| 问题 | 答案 |
|------|------|
| 能否「一键成片」直接选官方画廊里的每一个示例？ | **部分可以**。已内置 `manim_moving_frame_box`、`manim_point_with_trace` 等精选镜头；其余仍用 **75 个注册 `type`** + `custom_python` 粘贴官方代码。 |
| 能否在本系统里**渲染出与官方一致的画面**？ | **可以**。把官方 `class Xxx(Scene)` 粘贴为 `custom_python`（或 Manim 页示例画廊 →「应用到任务」），即可走同一套 Manim 渲染链。 |
| 与「官网案例」的定位差异 | 本系统是 **分镜流水线 + 模板库**；官方文档是 **完整 Manim API 参考**。两者互补，不是 1:1 菜单对应。 |

**实现路径说明：**

| 标记 | 含义 |
|------|------|
| 🟢 内置 | 已有注册 `type`，可在 `shots[]` 里直接写 `type` |
| 🟡 近似 | 内置模板画面类似，细节与官方不完全一致 |
| 🔵 custom_python | 粘贴官方代码即可复现 |
| 🟠 需 texlive | `Tex` / `MathTex` / `get_tex()` 清晰显示需 `install-texlive-optional.sh`；未装时部分示例降级为 `mk_text` 或渲染失败 |
| 🟣 需 OpenGL | `ThreeDScene` / `MovingCameraScene` / `ZoomedScene` 需 `install-opengl-deps.sh` + xvfb |

#### Basic Concepts（5）

| 官方示例 | 本系统 |
|----------|--------|
| ManimCELogo | 🔵 + 🟠（`MathTex` 字母 M；形状部分可用 `custom_python`） |
| BraceAnnotation | 🔵（已收录 `official_custom_examples.json`）；🟠 `get_tex` |
| VectorArrow | 🔵（已收录）；🟡 `coordinate_grid` + `vector_sum` |
| GradientImageFromArray | 🔵；🟡 `image_focus` |
| BooleanOperations | 🔵 |

#### Animations（8）

| 官方示例 | 本系统 |
|----------|--------|
| PointMovingOnShapes | 🔵 |
| MovingAround | 🔵 |
| MovingAngle | 🔵 |
| MovingDots | 🔵 |
| MovingGroupToDestination | 🔵 |
| MovingFrameBox | 🟢 `manim_moving_frame_box`；🟠 texlive |
| RotationUpdater | 🔵 |
| PointWithTrace | 🟢 `manim_point_with_trace`（`demo` / `parametric`） |

#### Plotting with Manim（5）

| 官方示例 | 本系统 |
|----------|--------|
| SinAndCosFunctionPlot | 🟢 `function_graph`；🔵 完整版 |
| ArgMinExample | 🔵；🟢 `function_graph` |
| GraphAreaPlot | 🔵；🟡 `bar_chart` / `function_graph` |
| PolygonOnAxes | 🔵；🟢 `coordinate_grid` |
| HeatDiagramPlot | 🔵（`numpy` + `ImageMobject`） |

#### Special Camera Settings（7）

| 官方示例 | 本系统 |
|----------|--------|
| FollowingGraphCamera | 🔵 + 🟣（`MovingCameraScene`） |
| MovingZoomedSceneAround | 🔵 + 🟣（`ZoomedScene`） |
| FixedInFrameMObjectTest | 🔵 + 🟣（`ThreeDScene`） |
| ThreeDLightSourcePosition | 🔵 + 🟣；🟢 `scene_3d_surface` / `manim_parametric_surface`（曲面类，非同款灯光演示） |
| ThreeDCameraRotation | 🔵 + 🟣；🟢 `scene_3d_orbit` / `manim_curve_3d` |
| ThreeDCameraIllusionRotation | 🔵 + 🟣 |
| ThreeDSurfacePlot | 🔵 + 🟣；🟢 `manim_parametric_surface`（`SurfaceScene`） |

#### Advanced Projects（2）

| 官方示例 | 本系统 |
|----------|--------|
| OpeningManim | 🔵 + 🟠（`Tex` / `MathTex` / 网格非线性变换） |
| SineCurveUnitCircle | 🔵；🟡 `sine_waveform` / `function_graph`（示意，非单位圆推导全流程） |

**推荐用法：**

1. **量产科普片**：用 §7.5 注册 `type` + Remotion 包装（一键成片）。
2. **复现官方某一镜**：Manim 页 → 示例画廊 / 粘贴官方代码 → `custom_python` 单镜渲染 → 再插入 `shots` 或单独下载 MP4。
3. **参数曲线类**：优先 `formula_curve` 或 `manim_custom` + `params.scene`，少写 Python。

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

### 示例 D：读书方法「10 个真正有效的方法」

| 步 | 操作 |
|----|------|
| 1 | 一键成片 → **读书训练** 加载 `examples/projects/reading-study/project.json` |
| 2 | 预览分镜（约 50 镜：章节 + 打字机 + 曲线隐喻 + 10 个学习方法 Manim 信息图） |
| 3 | 正式生成 → 任务管理下载 MP4 / 工程包 |
| 4 | （可选）任务管理 → **本地归档** 到本机项目文件夹 |

### 示例 E：复现 Manim 官方画廊某一镜

| 步 | 操作 |
|----|------|
| 1 | 打开 [官方 Example Gallery](https://docs.manim.community/en/stable/examples.html)，复制目标 `Scene` 类代码 |
| 2 | **Manim** 页 → **自定义 Python** 或示例画廊 → 粘贴 / 应用 |
| 3 | 若含 `ThreeDScene`：ECS 执行 `sudo bash deploy/ecs/install-opengl-deps.sh` |
| 4 | 若含 `MathTex` / `Tex`：可选 `install-texlive-optional.sh` |
| 5 | 单镜渲染成功后，可将 `custom_python` 镜头并入 `shots[]` 参与一键成片 |

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
| ECS `git pull` 超时 | 国内服务器访问 GitHub 443 不稳定 | 换镜像：`git remote set-url origin https://ghfast.top/https://github.com/guoqingr2026/sunshinelife_ai_videos.git` 再 pull；或 Windows `deploy/ecs/upload-from-windows.ps1` |
| `custom_python` ThreeD 黑屏 | 缺 OpenGL 依赖 | `sudo bash deploy/ecs/install-opengl-deps.sh` |
| 本地归档按钮无效 | 非 Chrome/Edge 或未授权文件夹 | 换浏览器；或用 `scripts/sync-ecs-to-local.ps1` |

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
| GET | `/api/manim/examples` | 场景示例 + 官方 `custom_python` 条目 |
| GET | `/api/manim/universe-scenes` | 数学宇宙 scene 列表 |
| POST | `/api/tasks/:id/purge-assets` | 归档后删除服务器任务素材 |
| GET | `/api/tasks` | 任务列表 |

---

## 13. 相关文档

| 文档 | 内容 |
|------|------|
| [README.md](../README.md) | 安装与快速启动 |
| [manim-automation-guide.md](./manim-automation-guide.md) | Manim 类型、params、API 详解 |
| [local-archive-and-baidu.md](./local-archive-and-baidu.md) | 本地归档与 ECS 同步 |
| [deploy/ecs/README.md](../deploy/ecs/README.md) | 阿里云 ECS 部署 |
| [examples/projects/math-2pow-t-equals-t32/](../examples/projects/math-2pow-t-equals-t32/) | 数学题完整示例工程 |
| [examples/projects/reading-study/](../examples/projects/reading-study/) | 读书训练示例工程 |
| [Manim Example Gallery](https://docs.manim.community/en/stable/examples.html) | 官方场景代码（经 `custom_python` 接入） |

---

## 14. 版本记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-03 | 字幕、Manim、HyperFrames、Remotion、B 站文案、任务管理 |
| v1.1 | 2026-09 | 镜头规划 → 一键成片衔接；提示词库；HyperFrames 环境检测；导航工作流重排；字体预设；output 工程包自动导出 |
| v1.2 | 2026-09 | 完整罗列 Remotion 16 种 + Manim 63 种 + 数学宇宙 33 scene；流水线映射表；时长参数；谐波/Spirograph 场景 @ `c08e9b1` |
| v1.3 | 2026-09 | 读书训练 10 种 + 官方画廊精选（公式框选、动点轨迹）；本地归档 / 站点门户；§7.9 Gallery 对照；Manim 75 种 |

---

*本文档描述的是面向**最终用户**的操作规格。开发实现细节以仓库源码为准。*
