# SunshineLife AI Videos — 产品规格书

> **文档版本：** v1.7（2026-09）  
> **适用代码：** `main` @ `d449a12` 及之后  
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
| ④ | Manim | `/config/manim` | 单镜调试、**开放 params JSON**、示例对照表、素材库、我的示例库、`custom_python` |
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

**类型 ID 约束：** `type` 必须是系统已注册 ID（见 §7.5、§7.7）。**`params` 不做白名单校验**——任意 JSON 键会透传到 Manim `get_params()`（§7.5.13）。勿使用 GPT 自造 `type`；别名见 §7.5.12，未知 `type` 会导致成片失败。

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

| 区域 | 功能 |
|------|------|
| 左侧 | 场景类型下拉、**快捷示例**（可收起）、**开放 params JSON 编辑器**（非白名单，任意键） |
| 右侧预览下 | **素材库**（上传图片/视频 → `/files/uploads/sceneN_英文名.ext`）、**我的示例库**（浏览器本地保存 type+params）、**场景示例对照表**（58+ 条：type / 分类 / 可改 params） |
| 特殊编辑器 | `custom_python` 多行 Scene 代码；`formula_curve` 公式构建器 |

- **能力索引**：左侧面板展示 `paramHelp`；**不要求**为每个字段单独做表单注册
- **示例库**：`GET /api/manim/examples`（`scene_examples.json` + `official_custom_examples.json`）；点击行即填入 `type` + `params`
- **官方画廊**：§7.5.11 共 12 种 `type`；其余官方示例经 `custom_python` 粘贴，见 §7.9

**推荐工作流：**

1. 选 `type` → 在对照表或示例库点一行 → 在 JSON 中**自由增删改** `params`（见 §7.5.13）
2. 需图片/视频 → 素材库上传 → 自动写入 `imagePath` / `videoPath` / `svgPath`
3. 调满意 → 「我的示例库」保存 → 一键成片 `shots[]` 复用相同 `params`
4. `GET /api/manim/status` 查看 `manimInstalled` / `mode: real|placeholder`

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

共 **85** 种，经 `resolveManimType()` 识别；其中 **84** 种在 `manim/template_catalog.py` 有 Python 模板，`custom_python` 另走代码粘贴（仍计入镜头规划类型表）。

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

#### 7.5.11 官方画廊精选（12）

| ID | 中文 | 说明 |
|----|------|------|
| `manim_moving_frame_box` | 公式框选 | MovingFrameBox：分段 MathTex + 框选（**建议 texlive**） |
| `manim_point_with_trace` | 动点轨迹 | PointWithTrace：`demo` / `parametric` |
| `manim_vector_arrow` | 向量箭头 | VectorArrow：NumberPlane + Arrow |
| `manim_brace_annotation` | 括号标注 | BraceAnnotation：Brace + 文字/公式 |
| `manim_sin_cos_plot` | 正弦余弦图 | SinAndCosFunctionPlot：双曲线 |
| `manim_point_on_path` | 路径动点 | PointMovingOnShapes：沿圆运动 + 旋转 |
| `manim_moving_angle` | 动态角度 | MovingAngle：ValueTracker + θ |
| `manim_sine_unit_circle` | 单位圆正弦 | SineCurveUnitCircle：圆推导正弦 |
| `manim_boolean_ops` | 布尔运算 | BooleanOperations：交/并/差/补 |
| `manim_following_camera` | 相机跟随 | FollowingGraphCamera：沿曲线跟拍 |
| `manim_graph_area` | 曲线面积 | GraphAreaPlot：黎曼和 + 面积 |
| `manim_heat_diagram` | 热图折线 | HeatDiagramPlot：折线热力学示意 |

示例见 `manim/scene_examples.json`（Manim 页画廊 →「官方画廊精选」）；实现于 `manim/templates/gallery_scenes.py`。

#### 7.5.11.1 画廊镜头通用 `params` 字段

所有 §7.5.11 镜头均支持以下**通用字段**（写入 `shots[].params` 或 Manim 单镜页 JSON）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 中文标题（走 `cjk_font` / `fontPresetId`） |
| `title_font_size` | number | 标题字号，默认 32 |
| `label_font_size` / `font_size` | number | 标注、轴标签字号 |
| `formula_font_size` | number | MathTex 字号（公式类镜头） |
| `hold_seconds` | number | 场景结尾停留秒数 |
| `run_times` | object | 分步动画秒数，如 `{ "axes": 1, "curves": 1.2 }` |
| `{step}_run_time` | number | 单步时长别名，如 `follow_run_time` ≡ `run_times.follow` |
| `primaryColor` 等 | string | 可覆盖成片 `theme` 颜色 |
| `cjk_font` | string | 覆盖中文字体 |

**表达式约定：** 绘图类 `*_expr` 使用 `x` 或 `t` 为自变量，支持 `sin/cos/exp/pow/**` 等（见 `manim/templates/_formula_eval.py`）。

**分类型关键字段（节选）：**

| `type` | 除通用外的重要字段 |
|--------|-------------------|
| `manim_sin_cos_plot` | `sin_expr`, `cos_expr`, `x_range`, `y_range`, `vertical_at` |
| `manim_graph_area` | `curve_1_expr`, `curve_2_expr`, `riemann_x_range`, `area_x_range`, `vertical_lines_at`, `riemann_dx` |
| `manim_following_camera` | `curve_expr`, `camera_scale`, `curve_x_min`/`curve_x_max`, `restore_camera` |
| `manim_vector_arrow` | `arrow_start`, `arrow_end`, `plane_x_range`, `plane_y_range` |
| `manim_brace_annotation` | `dot1`, `dot2`, `horizontal_label`, `formula_label` |
| `manim_point_on_path` | `circle_center`, `circle_radius`, `rotate_about`, `line_start`/`line_end` |
| `manim_moving_angle` | `theta_start`/`theta_mid`/`theta_end`, `theta_increment`, `angle_radius` |
| `manim_sine_unit_circle` | `origin_x`, `circle_radius`, `curve_x_scale`, `run_seconds` |
| `manim_boolean_ops` | `operations`, `ellipse_width`/`height`, `ellipse1_shift`/`ellipse2_shift` |
| `manim_heat_diagram` | `x_vals`, `y_vals`, `x_range`, `y_range` |
| `manim_moving_frame_box` | `parts`, `highlight_indices`, `frame_buff` |
| `manim_point_with_trace` | `mode`, `x`/`y`, `moves`, `move_run_times` |

完整默认值与说明：`frontend/utils/manim-capabilities.ts` 各条目的 `defaultParams` / `paramHelp`。

#### 7.5.13 开放参数原则（**无需为每个字段注册**）

> **产品原则：** 制作视频时应能**自由设置** Manim 能力对应的全部参数；**只注册 `type` 一次**，不为 `params` 里每个键单独做 UI/后端注册。

| 层级 | 需要注册？ | 位置 | 说明 |
|------|------------|------|------|
| **`shots[].type`** | ✅ 必须 | `manim/template_catalog.py` | 路由到 Python `Scene` 类；共 **85** 种 + `custom_python` |
| **`shots[].params` 任意键** | ❌ 不需要 | 成片 / Manim 页 JSON | **透传**，后端无字段白名单 |
| **`paramHelp` / `defaultParams`** | 文档用 | `frontend/utils/manim-capabilities.ts` | 能力说明与一键填充默认值；**非运行时门禁** |
| **locale 默认值** | 可选 | `manim/locale/zh.json` | 与 `get_params(fallback)` 合并，API 传入优先 |

**参数合并顺序（Python `templates/_params.py`）：**

```
locale/zh.json[type]  <  模板内 fallback  <  MANIM_PARAMS（API / shots[].params）
```

**成片传递链：**

```
project.shots[].params  →  compose.renderManim  →  MANIM_PARAMS  →  Scene.get_params()
```

因此：GPT 分镜、一键成片、Manim 单镜页写入的 **任意合法 JSON 键** 都会到达模板；模板内用 `p.get("字段名")` 读取即可，**新增可调参数只需改 Python 模板 + 更新 `manim-capabilities.ts` 文档**，无需改 Express 路由或新增表单项。

**全类型通用 `params`（可与 `theme` 叠加）：**

| 字段 | 说明 |
|------|------|
| `cjk_font` / `font` / `fontFamily` | 覆盖中文 `Text` 字体（`mk_text` / `mk_title`） |
| `primaryColor` / `secondaryColor` / `backgroundColor` / `accentColor` | 覆盖场景主题色（`apply_scene_theme`） |
| `title_font_size` / `label_font_size` / `formula_font_size` / `font_size` | 字号（画廊与多数模板已支持） |
| `hold_seconds` / `rotate_seconds` / `curve_run_time` / `run_times` | 动画节奏（3D 宇宙、画廊镜头常用） |
| `imagePath` / `videoPath` / `svgPath` | 媒体路径，`/files/uploads/...`（§7.10.9） |

**三层自由度（由低到高）：**

| 层级 | 用法 | 何时选 |
|------|------|--------|
| L1 注册 `type` + 开放 `params` | `typewriter_text`、`manim_formula`、`manim_moving_frame_box` 等 **85** 种 | 量产、GPT 分镜、对照表改 JSON |
| L2 `manim_custom` | `params.scene` 选宇宙场景 + 该场景全部 params（`n`、`colors`、`hold_seconds`…） | 数学曲线/3D/分形，一个 type 覆盖 33 scene |
| L3 `custom_python` | `params.code` 完整 Scene 类 | 官方画廊未内置 type、复杂迭代动画 |

**与「注册」相关的唯一维护清单（新增 `type` 时）：**

1. `manim/templates/*.py` + `template_catalog.py`
2. `frontend/utils/manim-capabilities.ts`（`defaultParams` / `paramHelp`）
3. `backend/.../shot-plan-spec.ts`（GPT 类型表，可选别名）
4. （可选）`manim/scene_examples.json` 示例一行

**不要**为每个新参数增加：Express 校验字段、前端专用表单（除非体验增强，如 `formula_curve` 构建器）。

**参数发现入口（免注册查询）：**

| 入口 | 内容 |
|------|------|
| Manim 页 → 场景示例对照表 | 每示例 × `paramHelp` 对照，✓ 表示示例 JSON 已含该字段 |
| `GET /api/manim/examples` | 全部示例 params |
| `GET /api/manim/catalog` | 全部 `type` + locale 默认 |
| `GET /api/manim/universe-scenes` | `manim_custom` 的 scene 列表 |
| `frontend/utils/manim-capabilities.ts` | **单一能力元数据源**（与 `template_catalog.py` ID 对齐） |

**LaTeX / 口播补充（近期行为）：**

| `type` | 要点 |
|--------|------|
| `manim_formula` / `mathtex_*` / `formula_steps` | `formula`、`steps`、`parts` 等支持 LaTeX；需 texlive（§9.3） |
| `typewriter_text` | `highlight` 或 `highlights`：正文内关键词 accent 色高亮 |
| `image_focus` / `video_embed` / `svg_icon` | `imagePath` / `videoPath` / `svgPath` ← 素材库 URL |

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

**新增 Remotion 包装模块**需同步：`SimpleElectric.tsx` + `remotion-presets`。**新增 Manim `type`** 见 §7.5.13 维护清单（**仅注册 type**；`params` 键随模板开放，无需逐项注册）。**新增 `params` 字段**仅改对应 Python 模板 + `manim-capabilities.ts` 文档即可。

### 7.9 与 Manim 官方 Example Gallery 的对应关系

官方画廊：[Manim Community — Example Gallery](https://docs.manim.community/en/stable/examples.html)（v0.21，**27** 个独立示例，分 5 类；完整表见 §7.9.1）。

**结论（先读这句）：**

| 问题 | 答案 |
|------|------|
| 能否「一键成片」直接选官方画廊里的每一个示例？ | **大部分可以**。§7.5.11 共 **12** 个画廊 `type` 覆盖 P0–P2；3D 变焦等仍用 `custom_python`。 |
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
| BraceAnnotation | 🟢 `manim_brace_annotation`；🟠 `get_tex` |
| VectorArrow | 🟢 `manim_vector_arrow` |
| GradientImageFromArray | 🔵；🟡 `image_focus` |
| BooleanOperations | 🟢 `manim_boolean_ops` |

#### Animations（8）

| 官方示例 | 本系统 |
|----------|--------|
| PointMovingOnShapes | 🟢 `manim_point_on_path` |
| MovingAround | 🔵 |
| MovingAngle | 🟢 `manim_moving_angle`；🟠 MathTex θ |
| MovingDots | 🔵 |
| MovingGroupToDestination | 🔵 |
| MovingFrameBox | 🟢 `manim_moving_frame_box`；🟠 texlive |
| RotationUpdater | 🔵 |
| PointWithTrace | 🟢 `manim_point_with_trace`（`demo` / `parametric`） |

#### Plotting with Manim（5）

| 官方示例 | 本系统 |
|----------|--------|
| SinAndCosFunctionPlot | 🟢 `manim_sin_cos_plot` |
| ArgMinExample | 🔵；🟢 `function_graph` |
| GraphAreaPlot | 🟢 `manim_graph_area` |
| PolygonOnAxes | 🔵；🟢 `coordinate_grid` |
| HeatDiagramPlot | 🟢 `manim_heat_diagram` |

#### Special Camera Settings（7）

| 官方示例 | 本系统 |
|----------|--------|
| FollowingGraphCamera | 🟢 `manim_following_camera`（MovingCameraScene；无则降级为沿路径动点） |
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
| SineCurveUnitCircle | 🟢 `manim_sine_unit_circle` |

**推荐用法：**

1. **量产科普片**：用 §7.5 注册 `type` + Remotion 包装（一键成片）。
2. **复现官方某一镜**：Manim 页 → 示例画廊 / 粘贴官方代码 → `custom_python` 单镜渲染 → 再插入 `shots` 或单独下载 MP4。
3. **参数曲线类**：优先 `formula_curve` 或 `manim_custom` + `params.scene`，少写 Python。

#### 7.9.1 官方画廊 27 例完整对照表

来源：[Manim Example Gallery](https://docs.manim.community/en/stable/examples.html)（v0.21）。

| # | 官方示例 | 状态 | 本系统用法 | 依赖 / 条件 | 备注 |
|---|----------|------|------------|-------------|------|
| 1 | ManimCELogo | 🔵 | `custom_python` | 🟠 texlive | Logo + MathTex `\mathbb{M}` |
| 2 | BraceAnnotation | 🟢 | **`manim_brace_annotation`** | 🟠 `get_tex` | 括号标注 |
| 3 | VectorArrow | 🟢 | **`manim_vector_arrow`** | — | NumberPlane + Arrow |
| 4 | GradientImageFromArray | 🔵 | `custom_python` | numpy | 🟡 近似：`image_focus` |
| 5 | BooleanOperations | 🟢 | **`manim_boolean_ops`** | — | 并/交/差/补集动画 |
| 6 | PointMovingOnShapes | 🟢 | **`manim_point_on_path`** | — | 沿圆 MoveAlongPath |
| 7 | MovingAround | 🔵 | `custom_python` | — | 🟡 近似：`transform_demo` |
| 8 | MovingAngle | 🟢 | **`manim_moving_angle`** | 🟠 MathTex θ | ValueTracker + Angle |
| 9 | MovingDots | 🔵 | `custom_python` | — | 双点连线 updater |
| 10 | MovingGroupToDestination | 🔵 | `custom_python` | — | VGroup 对齐移动 |
| 11 | MovingFrameBox | 🟢 | **`manim_moving_frame_box`** | 🟠 公式 texlive；中文标题走字体预设 | Manim 页「官方画廊精选」 |
| 12 | RotationUpdater | 🔵 | `custom_python` | — | `add_updater` 旋转 |
| 13 | PointWithTrace | 🟢 | **`manim_point_with_trace`**（`demo` / `parametric`） | — | 参数模式可画 2D 公式轨迹 |
| 14 | SinAndCosFunctionPlot | 🟢 | **`manim_sin_cos_plot`** | — | sin/cos 双曲线 |
| 15 | ArgMinExample | 🔵 | `custom_python` | — | ValueTracker 求极值 |
| 16 | GraphAreaPlot | 🟢 | **`manim_graph_area`** | — | 黎曼和/面积 |
| 17 | PolygonOnAxes | 🔵 | `custom_python` | — | 反比例矩形；🟡 `coordinate_grid` |
| 18 | HeatDiagramPlot | 🟢 | **`manim_heat_diagram`** | — | 折线热图 |
| 19 | FollowingGraphCamera | 🟢 | **`manim_following_camera`** | MovingCameraScene（无则降级） | 相机跟随 |
| 20 | MovingZoomedSceneAround | 🔵 | `custom_python` | 🟣 ZoomedScene | 放大镜场景 |
| 21 | FixedInFrameMObjectTest | 🔵 | `custom_python` | 🟣 ThreeDScene | 固定 HUD 文字 |
| 22 | ThreeDLightSourcePosition | 🟡 | `manim_parametric_surface` / `scene_3d_surface` | 🟣 OpenGL | 曲面近似，非灯光教程 |
| 23 | ThreeDCameraRotation | 🟡 | `scene_3d_orbit` / `manim_curve_3d` | 🟣 OpenGL | 环境旋转近似 |
| 24 | ThreeDCameraIllusionRotation | 🔵 | `custom_python` | 🟣 OpenGL | 错觉旋转 |
| 25 | ThreeDSurfacePlot | 🟢 | **`manim_parametric_surface`**（`SurfaceScene`） | 🟣 OpenGL | 高斯曲面类 |
| 26 | OpeningManim | 🔵 | `custom_python` | 🟠 texlive | 网格非线性变换综合示例 |
| 27 | SineCurveUnitCircle | 🟢 | **`manim_sine_unit_circle`** | 🟠 | 单位圆推导正弦 |

**统计（27 行含 SineCurveUnitCircle）：**

| 状态 | 数量 | 说明 |
|------|------|------|
| 🟢 已内置 `type` | **14** | §7.5.11 画廊 12 种 + `manim_parametric_surface`（ThreeDSurfacePlot）等 |
| 🟡 内置近似 | **3** | 3D 灯光/旋转等与官方不完全一致 |
| 🔵 仅 `custom_python` | **10** | ManimCELogo、MovingZoomed、OpeningManim 等 |
| 🟠 需 texlive | **10+** | 含 MathTex / Tex / `get_tex` |
| 🟣 需 OpenGL | **7** | 3D / 变焦 / 跟拍相机 |

### 7.10 配置参考手册（速查）

成片与 Manim 的**颜色、中文字体**可在 Web 配置；**全部已文档化的 `params` 均可在 JSON 中自由设置**（§7.5.13），无需为每个字段单独注册 UI。

#### 7.10.1 项目 `theme` 对象（一键成片 / JSON）

```json
{
  "theme": {
    "name": "B站粉",
    "primaryColor": "#fb7299",
    "secondaryColor": "#23ade5",
    "backgroundColor": "#141420",
    "accentColor": "#ffe066",
    "fontPresetId": "noto-sans-sc"
  }
}
```

| 字段 | 作用范围 | 说明 |
|------|----------|------|
| `backgroundColor` | Manim + Remotion | Manim 场景背景（`apply_scene_theme`） |
| `primaryColor` | Manim + Remotion | 标题、主强调色 |
| `secondaryColor` | Manim + Remotion | 次强调、部分图形 |
| `accentColor` | Manim + Remotion | 高亮、框线默认色 |
| `fontPresetId` | Manim 中文 `Text` + Remotion CSS | 见 §7.10.2；后端解析为 `manimCjkFont` / `cjk_font` |
| `fontFamily` | 主要 Remotion | CSS 字体栈；Manim 仅在无 `fontPresetId` 时尝试解析 |
| `manimCjkFont` | Manim | 直接指定 Manim `Text()` 字体名，优先级高于 `fontPresetId` |

**配置入口：**

| 入口 | 配色 | 字体 |
|------|------|------|
| 一键成片页 | 「配色方案」下拉 | 「字体预设」下拉（提交时写入 `theme`） |
| 项目 JSON `theme` 块 | 手写 hex 或 `name` 匹配预设 | `fontPresetId` 或 `manimCjkFont` |
| Manim 单镜页 | — | 字体预设 + `params.cjk_font` |
| 单镜 `params` | `primaryColor` 等可覆盖（注入 `MANIM_PARAMS`） | `cjk_font` / `font` / `fontFamily` |

内置配色名（`frontend/utils/remotion-presets.ts`）：工程红、科技蓝、半导体绿、学术紫、简约白、清新浅蓝、B站粉 等。

#### 7.10.2 字体预设 `fontPresetId` 一览

| `fontPresetId` | 显示名 | Manim 字体名 | ECS 说明 |
|----------------|--------|--------------|----------|
| `noto-sans-sc` | 思源黑体（推荐） | Noto Sans SC | `install-fonts.sh` 已含 |
| `microsoft-yahei` | 微软雅黑 | Microsoft YaHei | Linux 映射为 Noto Sans SC |
| `pingfang` | 苹方 | PingFang SC | Linux 映射为 Noto Sans SC |
| `kaiti` | 楷体（教材感） | KaiTi | Linux 映射 **AR PL UKai CN** |
| `arial` | Arial | Arial | 英文为主 |
| `georgia` | Georgia | Georgia | 衬线 |

**重要区分：**

| 内容类型 | 能否用字体预设？ | 说明 |
|----------|------------------|------|
| 中文标题 / `mk_text` | ✅ | `乘积求导法则` 等 |
| Remotion 包装字幕 | ✅ | `fontFamily` CSS |
| **MathTex / Tex 公式** | ❌ | LaTeX 数学字体；需 texlive，与 `cjk_font` 无关 |
| 英文 `Text('Horizontal distance')` | ✅ | 走 Manim 西文字体 |

#### 7.10.3 镜头时长与 Manim 内部节奏

| 层级 | 字段 | 位置 | 作用 |
|------|------|------|------|
| 成片时间轴 | `durationSeconds` | `shots[]` 根级 | Remotion 槽位秒数（30fps） |
| 成片时间轴 | `durationInFrames` | `shots[]` 根级 | 槽位帧数（优先于默认 150） |
| Manim 内部 | `hold_seconds` | `params` | 场景结尾停留 |
| Manim 内部 | `curve_run_time` / `intro_run_time` | `params` | 曲线绘制、3D 引入 |
| Manim 内部 | `rotate_seconds` | `params` | 3D 相机旋转（宇宙 scene） |

成片槽位与 Manim 动画时长**独立**：槽位太短会截断 MP4 尾部。

#### 7.10.4 单镜 `params` 能力边界

| 能力 | 成片 `theme` | 单镜 `params` | 说明 |
|------|-------------|---------------|------|
| 背景色 / 主色 / 强调色 | ✅ | ✅ 可覆盖 | 主题级 |
| 中文字体 | ✅ `fontPresetId` | ✅ `cjk_font` | `mk_text` / `mk_title` |
| 标题 / 标注 / 公式字号 | — | ✅ | 画廊全支持；其他 type 见 `paramHelp` |
| 分步动画时长 | — | ✅ | `run_times`、`hold_seconds` 等 |
| 坐标 / 表达式 / 数组 | — | ✅ | 模板已读的键均可写；见 §7.5.11.1 与 `manim-capabilities.ts` |
| LaTeX 公式 | — | ✅ | `manim_formula`、`mathtex_*`、画廊 `parts` / `*_expr`；需 texlive |
| 图片 / 视频素材 | — | ✅ | `imagePath` / `videoPath` / `svgPath`；§7.10.9 |

**原则：** 后端**不拦截**未知 `params` 键；模板未实现的键会被忽略。极端布局或未覆盖能力 → **`manim_custom`** 或 **`custom_python`**（§7.5.13）。

#### 7.10.5 示例：`manim_moving_frame_box` 完整 params

```json
{
  "type": "manim_moving_frame_box",
  "label": "乘积求导",
  "durationSeconds": 8,
  "params": {
    "title": "乘积求导法则",
    "cjk_font": "KaiTi",
    "parts": [
      "\\frac{d}{dx}f(x)g(x)=",
      "f(x)\\frac{d}{dx}g(x)",
      "+",
      "g(x)\\frac{d}{dx}f(x)"
    ],
    "highlight_indices": [1, 3],
    "frame_color": "#ffe066",
    "primaryColor": "#fb7299",
    "backgroundColor": "#141420",
    "hold_seconds": 1
  }
}
```

#### 7.10.6 ECS 环境与脚本

| 脚本 | 用途 |
|------|------|
| `deploy/ecs/update-subpath.sh` | 日常 `git pull` + 构建 + pm2 |
| `deploy/ecs/install-fonts.sh` | Noto CJK + 文鼎楷体（楷体预设） |
| `deploy/ecs/install-texlive-optional.sh` | MathTex / Tex 清晰渲染 |
| `deploy/ecs/install-opengl-deps.sh` | ThreeDScene / OpenGL + xvfb |
| `scripts/sync-ecs-to-local.ps1` | Windows 拉取成片（HTTP 站点无法用浏览器选文件夹） |

**健康检查：** `curl http://localhost:3012/api/health` · `curl http://localhost:3012/api/manim/status`

#### 7.10.7 本地归档与门户

| 功能 | 说明 |
|------|------|
| 任务管理 → 选择本地文件夹 | 需 **HTTPS** 或 localhost；`http://47.99.184.249` 下请用 `sync-ecs-to-local.ps1` |
| 未选文件夹点「归档到本地」 | 回退为浏览器下载 ZIP/MP4 |
| 页脚站点门户 | ECS 根站 / 英语学习 / Manim 文档 |

#### 7.10.9 用户素材上传（Manim 页 · 素材库）

| 项 | 说明 |
|----|------|
| API | `POST /api/assets/upload`（multipart）、`GET /api/assets`、`DELETE /api/assets/:filename` |
| 存储 | `{STORAGE}/files/uploads/` |
| 命名 | `scene{序号}_{英文slug}.{ext}`（如 `scene1_product_intro.mp4`） |
| 成片用法 | `shots[].params.imagePath` / `videoPath` / `svgPath` = `/files/uploads/...` |
| 适用 `type` | `image_focus`、`video_embed`、`svg_icon`；路径由 `resolve_media_path` 解析 |

上传后 URL 可写入一键成片 JSON，**无需**为每个素材单独注册 type。

#### 7.10.10 一键成片预设按钮

| 按钮 | 工程路径 |
|------|----------|
| 学习 MVP | 内置遗忘曲线 |
| 数学题·快速版 / 完整版 | `examples/projects/math-2pow-t-equals-t32/` |
| 蒙提霍尔 | `examples/projects/monty-hall/` |
| 数学宇宙 | `manim_custom` 多 scene |
| 读书训练 | `examples/projects/reading-study/` |

### 7.11 官方画廊缺口与建议新增镜头（路线图）

**已实现（P0–P2，见 §7.5.11）：** `manim_vector_arrow`、`manim_brace_annotation`、`manim_sin_cos_plot`、`manim_point_on_path`、`manim_moving_angle`、`manim_sine_unit_circle`、`manim_boolean_ops`、`manim_following_camera`、`manim_graph_area`、`manim_heat_diagram`。

**待实现（P3，仍建议 `custom_python`）：**

| 优先级 | 建议 `type` | 对应官方示例 | 理由 |
|--------|-------------|--------------|------|
| P3 | `manim_zoomed_scene` | MovingZoomedSceneAround | 需 ZoomedScene + OpenGL |
| P3 | `manim_opening_demo` | OpeningManim | 综合演示片头（片段化） |
| P3 | `manim_gradient_image` | GradientImageFromArray | 像素渐变，低频 |

**暂不建议做成一键 `type`：** ManimCELogo、OpeningManim 全片、MovingZoomedSceneAround 长代码维护成本高。

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
| GET | `/api/manim/catalog` | 全部 Manim `type` + locale 默认 params |
| GET | `/api/manim/universe-scenes` | 数学宇宙 scene 列表 |
| GET | `/api/assets` | 用户上传素材列表 + `nextSceneIndex` |
| POST | `/api/assets/upload` | 上传图片/视频（multipart） |
| DELETE | `/api/assets/:filename` | 删除素材 |
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
| v1.4 | 2026-09 | §7.9.1 官方 27 例完整对照表；§7.10 配置手册（theme/字体/时长/ECS）；§7.11 缺口与新增路线图；Manim 字体 `fontPresetId` 传递修复 @ `b07403f` |
| v1.5 | 2026-09 | P0–P2 官方画廊 10 种新 `type`（`gallery_scenes.py`）；Manim **85** 种；§7.5.11 扩展为 12 种画廊镜头 |
| v1.6 | 2026-09 | 画廊 12 种 `params` 补全（表达式/坐标/字号/`run_times`）；§7.5.11.1 参数手册 |
| v1.7 | 2026-09 | **§7.5.13 开放参数原则**（只注册 type、params 透传）；Manim 页素材库/对照表/我的示例库；`manim_formula` LaTeX、`typewriter_text` 高亮；§7.10.9 素材 API @ `d449a12` |

---

*本文档描述的是面向**最终用户**的操作规格。开发实现细节以仓库源码为准。*
