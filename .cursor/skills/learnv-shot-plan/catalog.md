# Learnv 镜头类型速查

合法 `type` 以 `backend/src/services/video/shot-plan-spec.ts` 与 `manim/template_catalog.py` 为准。
参数细节以 `frontend/utils/manim-capabilities.ts` 的 `paramHelp` 为准。

## 强制高清（每个 project JSON）

```json
"renderQuality": "high"
```

- **Manim**：compose 传 `quality: "-qh"` → `render_task.py` 用 `-qh`
- **Remotion**：compose 传 `scale: "1"` → 全分辨率（非预览半分辨率）
- 正式成片禁止 `"renderQuality": "preview"`

## Remotion（成片包装，不跑 Manim）

| type | 用途 | 关键 params |
|------|------|-------------|
| `title` | 片头大标题 | `title` |
| `chapter` | 章节过渡 | `title` |
| `fade_text` | 淡入金句 | `text` |
| `quote` | 引用 | `quote`, `author` |
| `bullet_list` | 要点 | `title`, `items[]` |
| `compare` | 左右对比 | `leftTitle`, `rightTitle`, `leftText`, `rightText` |
| `flow_steps` | 步骤 | `steps[]` |
| `timeline_bar` | 时间轴 | `title`, `events[]` |
| `formula_card` | 公式卡（非 MathTex） | `formula`, `caption` |
| `stat` | 数据高亮 | `value`, `label` |
| `image_clip` | 静态图（ffmpeg→MP4） | `imagePath` |
| `composite_split` | **单镜**竖屏分屏 | `videoPath`, `main`, `mainRatio` |
| `composite_pip` | **单镜**画中画 | `videoPath`, `main`, `pipPosition` |

## 项目级全片实拍（非 shots[].type）

```json
"globalOverlay": {
  "mode": "split",
  "videoPath": "/files/uploads/demo.mp4",
  "mainRatio": 0.6,
  "overlayRatio": 0.4,
  "loop": true
}
```

- `mode: "split"` → 建议 `aspect: "9:16"`
- `mode: "pip"` → 建议 `aspect: "16:9"`
- 与 `composite_*` 二选一（全片用 globalOverlay）

## Manim — 文本 / 章节 / 公式

| type | 关键 params |
|------|-------------|
| `chapter_banner` | `chapter`, `title` |
| `typewriter_text` | `text`, `subtitle`, `highlight[]` |
| `keyword_pop` | `title`, `keywords[]` |
| `formula_steps` | `title`, `steps[]` |
| `mathtex_formula` | `title`, `formula`, `caption` |
| `mathtex_derivation` | `title`, `steps[]` |
| `manim_formula` | `title`, `formula`, 分步说明字段见 capabilities |
| `manim_moving_frame_box` | `title`, **`parts[]`**, `highlight_indices[]`, `hold_seconds` |
| `code_highlight` | `title`, `lines[]`, `highlight_line` |

## Manim — 信息图 / 学习

| type | 关键 params |
|------|-------------|
| `forgetting_curve` | `title`, `x_label`, `y_label` |
| `concept_network` | `title`, `center`, `nodes[]`（建议 ≤4） |
| `flowchart` | `title`, `steps[]` |
| `timeline_horizontal` | `events[]` |
| `learning_curve` | `title`, `hint` |
| `bar_chart` | `title`, `values[]` |
| `manim_compare_table` | `title`, `left_title`, `right_title`, `left_items[]`, `right_items[]` |
| `manim_outline` | `title` 等 |

## Manim — 曲线 / 3D / 混沌

| type | 说明 |
|------|------|
| `manim_cardioid` / `manim_rose_curve` / `manim_archimedean_spiral` / `manim_lissajous` | 2D 美学曲线；可设 `title`, `subtitle`, 形状参数 |
| `manim_lorenz_attractor` / `manim_rossler` / `manim_three_body` | 混沌 / 动力学 |
| `manim_curve_3d` / `manim_parametric_surface` | 3D |
| `manim_custom` | **`scene`** 必填：`HarmonicRibbon3D`, `LorenzScene`, `ParametricCurveScene`, …（`GET /api/manim/universe-scenes`） |
| `formula_curve` | `x`/`y`/`r` 公式字符串 |
| `custom_python` | `class_name` + `code`（完整 class） |

## Manim — 工程 / 英语（节选）

`pn_junction`, `band_structure`, `mosfet_channel`, `buck_converter`, `sine_waveform`, …
`vocab_card`, `grammar_highlight`, `dialogue_scene`

## 别名（可写，系统会解析）

- `lorenz_attractor` → `manim_lorenz_attractor`
- `video` / `video_clip` → `video_embed`
- `image_bookend` → `image_clip`
- `split_layout` → `composite_split`

## 主题色快捷

| name | 用途 |
|------|------|
| B站粉 `#fb7299` / 底 `#141420` | 科普娱乐 |
| 科技蓝 `#00d4ff` / 底 `#0a1628` | 理工硬核 |
| 半导体绿 `#00c896` / 底 `#0d1f17` | 器件电路 |
| 学术紫 `#a855f7` / 底 `#1e1b2e` | 学习方法 |

`fontPresetId`: 常用 `noto-sans-sc`；楷体口播风可用对应楷体预设。
