---
name: learnv-shot-plan
description: >-
  Designs Learnv / SunshineLife AI Videos one-click compose shot JSON from the
  registered Manim + Remotion library with open params. Use when the user asks
  for 分镜、一键成片 JSON、project.shots、科普视频镜头规划、math/physics popular-science
  video plans, globalOverlay, custom_python, or to generate a VideoProject for
  /config/auto-video.
---

# Learnv 分镜 JSON Skill

为数学 / 物理 / 工程科普生成**可直接粘贴到一键成片**的 `VideoProject` JSON。
内容必须来自用户主题，**禁止照搬示例库默认公式、章节名、口播**。

## 必读参考（按需打开）

| 文件 | 何时读 |
|------|--------|
| [catalog.md](catalog.md) | 选 `type`、写 `params` 字段 |
| [examples.md](examples.md) | 对照完整 JSON 结构 |
| `docs/product-spec.md` §5.3–5.4、§7.4–7.5 | 素材路径、globalOverlay、类型全表 |
| `frontend/utils/manim-capabilities.ts` | 某 type 的 `defaultParams` / `paramHelp` |
| `backend/src/services/video/shot-plan-spec.ts` | 合法 type ID 与别名 |

## 输出契约

只输出一个 JSON 对象（可围栏），根结构：

```json
{
  "title": "视频标题",
  "aspect": "16:9",
  "autoWrap": false,
  "theme": {
    "name": "科技蓝",
    "primaryColor": "#00d4ff",
    "secondaryColor": "#1b3a57",
    "backgroundColor": "#0a1628",
    "accentColor": "#7b68ee",
    "fontPresetId": "noto-sans-sc"
  },
  "shots": []
}
```

可选：`globalOverlay`（全片实拍，见 catalog）。竖屏口播底栏用 `"aspect":"9:16"` + `globalOverlay.mode:"split"`。

## 工作流

1. **拆主题** → 3～8 个章节/知识点（科普预告片）或 8～20 镜（完整课）。
2. **每镜选 type** → 优先注册 type；复杂方程框选用 `manim_moving_frame_box`；宇宙曲线用 `manim_custom`+`scene`；任意 Python 用 `custom_python`。
3. **写满可编辑内容** → 见下方「开放参数」；`label` 是短显示名，**正文必须进 `params`（或根级 `text`）**。
4. **校验** → `type` 合法；公式镜头有 `parts`/`formula`；`typewriter_text` 有 `text`；路径用 `/files/uploads/...`。
5. **交给用户** → 粘贴到 `/config/auto-video` → 预览分镜 → 一键生成。

## 开放参数（必须覆盖示例）

| type | 必填内容字段 | 说明 |
|------|--------------|------|
| `chapter` | `label` 或 `params.title` | Remotion 章节卡 |
| `chapter_banner` | `params.chapter` + `params.title` | Manim 章节横幅 |
| `title` / `fade_text` | `params.title` / `params.text` | |
| `typewriter_text` | **`text`**（根级或 params） | 口播；可加 `highlight[]`、`subtitle` |
| `mathtex_formula` / `manim_formula` | `params.formula` | LaTeX；可选 `title`、`caption` |
| `manim_moving_frame_box` | **`params.parts[]`** + `highlight_indices` | 分段公式；不写则落到乘积求导示例 |
| `formula_steps` | `params.steps[]` | |
| `concept_network` | `params.center` + `params.nodes[]` | |
| `manim_compare_table` | `left_title/right_title` + `left_items/right_items` | |
| `compare`（Remotion） | `leftTitle/rightTitle/leftText/rightText` | |
| `manim_custom` | **`params.scene`** | 如 `LorenzScene`、`HarmonicRibbon3D` |
| `custom_python` | **`params.code`** + `class_name` | 完整 Scene 类，type 不是类名 |
| `image_clip` | `params.imagePath` | `/files/uploads/xxx.jpg` |
| `bar_chart` | `params.values[]` + `title` | |

节奏：`durationSeconds`；3D：`hold_seconds` / `rotate_seconds`。

## 镜头节奏模板（科普）

```
image_clip(片头可选) → title → chapter → typewriter_text →
(公式/曲线/对比 Manim) → chapter → … → fade_text / image_clip(片尾)
```

穿插 3D/曲线：`manim_lorenz_attractor`、`manim_curve_3d`、`manim_lissajous`、`manim_custom`。
少用无内容的纯装饰镜；每镜服务一个知识点。

## 硬性禁止

- 把 Scene **类名**当作 `type`（应用 `custom_python`）
- 只改 `label` 却不改 `parts` / `formula` / `text`（画面仍是示例）
- 编造未注册 `type`（查 catalog / shot-plan-spec）
- `imagePath` 写磁盘绝对路径或带 `backend/storage` 前缀
- 默认 `autoWrap: true`（显式 shots 时用 `false`）

## 质量自检

- [ ] 所有公式/口播/章节标题来自**当前主题**，非「乘积求导」「半导体基础」
- [ ] Manim 公式镜含完整 `params`
- [ ] 16:9 或 9:16 与是否 `globalOverlay.split` 一致
- [ ] 镜头数与时长合理（预览片 ≤12 镜；长片可分组）
