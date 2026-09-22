# Manim 自动化使用手册

> 与 `manim/template_catalog.py`、`frontend/utils/manim-capabilities.ts`、`backend/src/services/video/shot-plan-spec.ts` 保持同步。  
> **params 优先级（低→高）：** 模板代码 fallback → `locale/zh.json` → API / `shots[].params`（用户内容永远覆盖示例）。

---

## 一、职责划分：Manim vs Remotion

| 层级 | 负责方 | 内容 |
|------|--------|------|
| **动画内容** | Manim | 示意图、图表、公式动画、英语卡片、3D 示意等 **画面内动画** |
| **成片包装** | Remotion | **背景色、全局配色、字体层级、章节卡、字幕、转场、BGM、logo、水印** |
| **主题** | Remotion `theme` | `primaryColor` / `secondaryColor` / `backgroundColor` / `accentColor`（见 `frontend/utils/remotion-presets.ts`） |

**结论：成片主题 `theme` 同时作用于 Remotion 包装层与 Manim 内容层。**  
一键成片时在 compose 请求里传 `theme`：`backgroundColor` / `primaryColor` / `secondaryColor` / `accentColor` 会注入每个 Manim 任务的 `params`，模板内调用 `apply_scene_theme(self)` 设置镜头背景与文字对比色。  
楷体预设（`KaiTi`）在 Linux ECS 自动映射为 **文鼎楷体**（`AR PL UKai CN`，见 `deploy/ecs/install-fonts.sh`）。

```
选题/文章 → project.shots JSON
  → Manim 渲染各镜头 .mp4（内容动画）
  → Remotion 按 theme 合成（背景/字体/转场/字幕）
  → 最终成片
```

---

## 二、系统调用链路

### 2.1 单镜头 API

```http
POST /api/manim/task
Content-Type: application/json

{
  "type": "forgetting_curve",
  "params": {
    "title": "艾宾浩斯遗忘曲线",
    "x_label": "时间",
    "y_label": "记忆保留率"
  }
}
```

- 响应：`{ "taskId", "status" }`
- 轮询：`GET /api/manim/task/{taskId}` → `outputUrl`、`clipJson`

### 2.2 一键成片（推荐自动化）

```http
POST /api/video/compose
{
  "title": "视频标题",
  "project": {
    "title": "视频标题",
    "shots": [
      { "type": "chapter_banner", "label": "开场", "params": { "chapter": "第1讲", "title": "牛顿第二定律" } },
      { "type": "mathtex_formula", "label": "核心公式", "params": { "title": "牛顿第二定律", "formula": "F = ma" } }
    ]
  },
  "preview": true,
  "renderFinal": true,
  "theme": {
    "primaryColor": "#e94560",
    "secondaryColor": "#0f3460",
    "backgroundColor": "#1a1a2e",
    "accentColor": "#f5a623"
  }
}
```

**Shot 项 schema：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | Manim 模板 ID 或 Remotion 类型 |
| `label` | string | ✅ | 显示标题，建议 ≤12 字 |
| `params` | object | ❌ | Manim 参数；省略则用 `manim/locale/zh.json` 中文默认 |

**Remotion 类型（非 Manim）：** `chapter`, `title`, `quote`, `bullet_list`, `fade_text`, `subtitle`, `flow_steps`, `timeline_bar`, `formula_card`, `compare`, `arrow`, `stat`, `params`, `image_clip`, `composite_split`, `composite_pip`

**项目级全片实拍（非 `shots[].type`）：** `project.globalOverlay` — 见下文 §2.5。

### 2.3 参数合并优先级

```
模板代码 fallback < manim/locale/zh.json < API / shots[].params（最高，覆盖示例公式与章节名）
```

一键成片还会把 `label` 在缺少 `title`/`text`/`chapter` 时写入 params（`enrichManimParams`），避免只改 label 仍显示「半导体基础」等默认文案。Remotion 的 `chapter`/`compare`/`formula_card` 等优先读 `params`，不再只用 label。

### 2.4 类型目录 API

```http
GET /api/manim/catalog
→ { types: string[], locale: {...}, customTypes: ["custom_python", "manim_custom", "formula_curve"] }
```

### 2.5 一键成片：实拍混排与 custom_python

详细用户指南见 **`docs/product-spec.md` §5.4**。摘要如下。

#### 2.5.1 全片底栏实拍 — `globalOverlay`

实拍从片头到片尾**一条视频连续播放**；`shots[]` 写普通 Manim/Remotion 镜头即可。

```json
{
  "aspect": "9:16",
  "globalOverlay": {
    "mode": "split",
    "videoPath": "/files/uploads/scene3_demo.mp4",
    "mainRatio": 0.6,
    "overlayRatio": 0.4,
    "loop": true
  },
  "shots": [
    { "type": "forgetting_curve", "label": "遗忘曲线", "params": { "title": "艾宾浩斯遗忘曲线" } }
  ]
}
```

- `loop` 省略时默认为 **`true`**（实拍短于成片则循环）。
- 与单镜 `composite_split` 不同：composite 只作用于**一个 shot** 的时长。

#### 2.5.2 单镜分屏 — `composite_split` / `composite_pip`

```json
{
  "type": "composite_split",
  "label": "本镜分屏",
  "durationSeconds": 20,
  "params": {
    "videoPath": "/files/uploads/scene3_demo.mp4",
    "mainRatio": 0.6,
    "main": { "type": "typewriter_text", "text": "仅本镜文案" }
  }
}
```

#### 2.5.3 自写 Python — `custom_python`

**无需在服务器注册**；`type` 必须是 `custom_python`，不是 Scene 类名。

```json
{
  "type": "custom_python",
  "label": "混沌吸引子",
  "durationSeconds": 16,
  "params": {
    "class_name": "ChaosAttractorScene",
    "code": "class ChaosAttractorScene(ThreeDScene):\n    def construct(self):\n        ..."
  }
}
```

推荐：Manim 页单镜调试 → 复制 `params` → 粘贴进 `shots[]`。

#### 2.5.4 静态片头片尾 — `image_clip`

```json
{
  "type": "image_clip",
  "label": "片头图",
  "durationSeconds": 5,
  "params": { "imagePath": "/files/uploads/scene1_start.jpg" }
}
```

合成前由 ffmpeg 栅格化为 MP4，再走 Remotion `<Video>`（ECS 稳定）。

---

## 三、四域 × 三层

| 域 | 选题 | 代表模板 |
|----|------|----------|
| semiconductor | 半导体、电路 | `pn_junction`, `circuit_loop` |
| learning | 科普、学习方法 | `concept_network`, `forgetting_curve` |
| english | 英语课 | `vocab_card`, `grammar_highlight`, `dialogue_scene` |
| media | 公式、3D、配图 | `mathtex_formula`, `scene_3d_surface`, `image_focus` |

| 层 | 说明 |
|----|------|
| L1 | 预设单场景，自动化优先 |
| L2 | 扩展图表/媒体/英语 |
| L3 | `custom_dsl`, `custom_python` |

---

## 四、环境依赖

| 模板 | 依赖 | 未安装时 |
|------|------|----------|
| `mathtex_*` | texlive（可选） | 文本降级，仍可出片 |
| `scene_3d_*` | OpenGL + xvfb | 可能失败 |
| `image_focus` / `svg_icon` | 文件路径有效 | 占位文字 |
| `video_embed` | mp4/mov/webm | 黄色提示 |

**ECS 安装：**

```bash
# 基础（git 更新 + 校验 + 重启 API）
bash deploy/ecs/update-manim.sh

# 可选：MathTex / LaTeX
sudo bash deploy/ecs/install-texlive-optional.sh

# 可选：ThreeDScene / OpenGL
sudo bash deploy/ecs/install-opengl-deps.sh

# 语法自检
bash deploy/ecs/verify-manim-templates.sh
```

**本地开发：** `pip install manim`；未安装时 API 生成占位视频（ffmpeg 色块）。

---

## 五、类型别名（禁止自造 ID）

| 别名 | 解析为 |
|------|--------|
| ebbinghaus, spaced_repetition | forgetting_curve |
| active_recall, learning_tips | typewriter_text |
| mind_map, knowledge_tree | concept_network |
| vocabulary, vocab | vocab_card |
| grammar | grammar_highlight |
| dialogue, conversation | dialogue_scene |
| mathtex, latex_formula | mathtex_formula |
| derivation | mathtex_derivation |
| image, picture | image_focus |
| svg | svg_icon |
| video_clip | video_embed |

---

## 六、全部模板参数规格

### 6.1 工程（semiconductor）

#### `pn_junction`
```json
{ "title": "PN 结", "voltage": 9, "current": 1 }
```

#### `band_structure`
```json
{ "title": "能带结构" }
```

#### `current_arrow`
```json
{ "voltage": 9, "current": 1, "resistance": 9, "title": "欧姆定律" }
```

#### `photon_breakdown`
```json
{ "photon_label": "hν" }
```

#### `semiconductor_layers` / `mosfet_channel` / `buck_converter` / `llc_resonant`
```json
{ "title": "标题文字" }
```

#### `sine_waveform`
```json
{ "freq": "50Hz", "title": "正弦波形" }
```

#### `circuit_loop`
```json
{ "title": "完整电路", "voltage": "12V", "component": "R1" }
```

#### `band_temperature`
```json
{ "title": "能带与温度", "temp_start": "300K", "temp_end": "400K" }
```

#### `isometric_stack`
```json
{ "title": "层叠结构" }
```

---

### 6.2 数学 / 图表（learning）

#### `function_graph`
```json
{ "title": "y = sin(x)", "label": "sin(x)" }
```
> 曲线固定 sin(x)，改标题/标签即可。

#### `coordinate_grid` / `vector_sum`
```json
{ "title": "标题" }
```

#### `bar_chart`
```json
{ "title": "数据统计", "values": [3, 5, 2, 7, 4] }
```

#### `pie_chart`
```json
{ "title": "数据占比", "values": [30, 25, 20, 25], "labels": ["A", "B", "C", "D"] }
```

#### `line_chart_compare`
```json
{
  "title": "趋势对比",
  "series": [
    { "name": "A", "values": [1, 3, 2, 5, 4] },
    { "name": "B", "values": [2, 2, 4, 3, 6] }
  ]
}
```

#### `crystal_lattice`
```json
{ "title": "晶体点阵", "rows": 4, "cols": 4 }
```

#### `orbit_paths` / `transform_demo`
```json
{ "title": "标题", "from_shape": "square", "to_shape": "circle" }
```
（`transform_demo` 需 from_shape / to_shape）

---

### 6.3 信息图 / 文本（learning）

#### `timeline_horizontal`
```json
{ "title": "发展历程", "events": ["起点", "阶段1", "终点"] }
```

#### `flowchart`
```json
{ "title": "流程", "steps": ["输入", "处理", "输出"] }
```

#### `forgetting_curve`
```json
{ "title": "遗忘曲线", "x_label": "时间", "y_label": "记忆保留" }
```

#### `concept_network`
```json
{ "title": "概念网络", "center": "核心", "nodes": ["A", "B", "C", "D"] }
```

#### `learning_curve`
```json
{ "title": "学习效率", "hint": "理解优先 → 长期留存" }
```

#### `typewriter_text`
```json
{ "text": "主动回忆", "subtitle": "学习技巧" }
```

#### `keyword_pop`
```json
{ "title": "要点", "keywords": ["理解", "记忆", "应用"] }
```

#### `formula_steps`
```json
{ "title": "公式", "steps": ["P = V * I", "V = I * R", "P = I^2 * R"] }
```

#### `chapter_banner`
```json
{ "chapter": "第1讲", "title": "章节名" }
```

#### `code_highlight`
```json
{
  "title": "代码",
  "lines": ["def f():", "    pass", "f()"],
  "highlight_line": 2
}
```

---

### 6.4 英语（english）

#### `vocab_card`
```json
{
  "title": "单词卡",
  "word": "recall",
  "phonetic": "/rɪˈkɔːl/",
  "meaning": "回想",
  "example": "Active recall helps memory."
}
```

#### `grammar_highlight`
```json
{
  "title": "语法",
  "pattern": "S + V + O",
  "sentence": "I love learning English.",
  "highlight": "love"
}
```

#### `dialogue_scene`
```json
{
  "title": "对话",
  "lines": [
    { "speaker": "A", "text": "How are you?" },
    { "speaker": "B", "text": "Fine, thanks." }
  ]
}
```

---

### 6.5 媒体 / 公式 / 3D（media）

#### `mathtex_formula`
```json
{ "title": "公式", "formula": "E = mc^2", "caption": "质能等价" }
```
LaTeX 在 JSON 中转义：`"\\frac{V}{R}"`

#### `mathtex_derivation`
```json
{ "title": "推导", "steps": ["V = IR", "I = \\frac{V}{R}", "P = VI"] }
```

#### `scene_3d_surface` / `scene_3d_orbit` ⚠️ OpenGL
```json
{ "title": "3D 曲面" }
```
```json
{ "title": "3D 轨道", "label": "轨道运动" }
```

#### `image_focus`
```json
{ "title": "示意图", "imagePath": "icon.svg", "caption": "" }
```
路径：`icon.svg`（`manim/assets/`）或 `/files/...`

#### `svg_icon`
```json
{ "title": "图标", "svgPath": "icon.svg", "scale": 2.5 }
```

#### `video_embed`
```json
{ "title": "片段", "videoPath": "/files/demo.mp4", "max_duration": 3 }
```

---

### 6.6 L3 高级

#### `custom_dsl`
```json
{
  "title": "场景",
  "objects": [
    { "id": "c1", "type": "circle", "radius": 1, "color": "BLUE" },
    { "id": "t1", "type": "text", "content": "文字", "shift": [0, -2, 0] }
  ],
  "timeline": [
    { "action": "create", "target": "c1" },
    { "action": "write", "target": "t1" },
    { "action": "wait", "duration": 1 }
  ]
}
```

**objects.type：** `circle` | `rect` | `text` | `arrow` | `dot`  
**timeline.action：** `create` | `fade_in` | `write` | `grow_arrow` | `wait` | `transform`

#### `custom_python`
```json
{
  "class_name": "MyScene",
  "code": "class MyScene(Scene):\n    def construct(self):\n        self.play(Create(Circle()))\n        self.wait(1)\n"
}
```

#### `manim_custom`（数学曲线宇宙 · 推荐）

无需为每条曲线单独注册 `type`，用 `params.scene` 指定场景类名即可：

```json
{
  "type": "manim_custom",
  "label": "心形线",
  "params": { "scene": "CardioidScene", "title": "心形线", "subtitle": "r = 1 - cos θ" }
}
```

**常用 scene 名：** `CardioidScene` · `RoseCurveScene` · `ArchimedeanSpiralScene` · `LorenzScene` · `MandelbrotScene` · `JuliaScene` · `KochSnowflakeScene` · `ThreeBodyScene` · `Curve3DScene` · `SurfaceScene`

完整列表：`GET /api/manim/universe-scenes`

也可直接用已注册别名：`manim_cardioid`、`manim_julia_set`、`manim_three_body` 等。

---

## 七、按选题推荐分镜

### 科普
`chapter_banner` → `concept_network` → `flowchart` → `keyword_pop`

### 数学
`chapter_banner` → `mathtex_formula` → `function_graph` → `mathtex_derivation`

### 物理
`chapter_banner` → `mathtex_formula` → `vector_sum` → `current_arrow` / `sine_waveform`

### 英语
`chapter_banner` → `vocab_card` → `grammar_highlight` → `dialogue_scene`

---

## 八、GPT 系统提示词

完整提示词由 `GET /api/video/shot-plan/spec` 的 `gptPrompt` 字段动态生成（含全部类型与关键词）。  
用户消息模板：

```text
【选题】{{主题}}
【受众】{{受众}}
【时长】3分钟，4个镜头
【文章正文】
{{讲稿}}

请输出 project JSON（title + shots），params 根据文章填写，禁止占位符。
配色与背景由 Remotion theme 处理，Manim 只负责动画内容。
```

---

## 九、输出物

```json
{
  "type": "manim_clip",
  "durationInFrames": 150,
  "title": "...",
  "manimType": "forgetting_curve",
  "sourceUrl": "/files/manim/{taskId}.mp4",
  "params": { }
}
```

---

## 十、自动化校验清单

- [ ] 每个 `type` 在合法列表或别名表中
- [ ] `shots` 数量 2～8
- [ ] 数组类型正确（`values` 为 number[]）
- [ ] `grammar_highlight.highlight` 出现在 `sentence` 中
- [ ] LaTeX 反斜杠已 JSON 转义
- [ ] 未滥用 `scene_3d_*`（需 OpenGL）
- [ ] 成片 `theme` 在 Remotion 侧配置，不在 Manim params 里

---

## 十一、output 工程包（一键成片自动导出）

每次「一键成片」完成后，系统自动在服务器生成：

```
storage/files/output/{taskId}/     # 可浏览的目录
storage/files/output/{taskId}.zip  # 下载到本地（ZIP 内根目录为 output/）
```

| 文件 | 说明 |
|------|------|
| `README.md` | 人类可读说明 |
| `project.json` | 原始分镜，可再次粘贴成片 |
| `timeline.json` | Remotion 时间轴 |
| `theme.json` | 配色主题 |
| `workflow.json` | 流程与步骤 |
| `assets/final.mp4` | 成片 |
| `assets/manim/*.mp4` | Manim 片段 |
| `logs/compose.log` | 制作日志 |

下载：`GET /api/video/compose/{taskId}/bundle` 或一键成片页「下载 output 工程包」。

---

## 十二、相关文件

| 文件 | 用途 |
|------|------|
| `manim/template_catalog.py` | 模板注册 |
| `manim/template_meta.py` | OpenGL / latex 元数据 |
| `manim/locale/zh.json` | 中文默认 params |
| `frontend/utils/manim-capabilities.ts` | 前端能力索引 |
| `backend/src/services/video/shot-plan-spec.ts` | GPT 关键词与规格 |
| `frontend/utils/remotion-presets.ts` | 配色主题 |
| `deploy/ecs/update-manim.sh` | ECS 更新脚本 |
