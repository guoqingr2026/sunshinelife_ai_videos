# 分镜 JSON 示例

## 1. 物理科普短片（公式可编辑）

```json
{
  "title": "牛顿第二定律：F=ma",
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
  "shots": [
    {
      "type": "title",
      "label": "牛顿第二定律",
      "durationSeconds": 4,
      "params": { "title": "牛顿第二定律" }
    },
    {
      "type": "chapter",
      "label": "核心公式",
      "params": { "title": "核心公式" }
    },
    {
      "type": "mathtex_formula",
      "label": "F=ma",
      "durationSeconds": 6,
      "params": {
        "title": "第二定律",
        "formula": "F = ma",
        "caption": "合力等于质量乘加速度"
      }
    },
    {
      "type": "manim_moving_frame_box",
      "label": "拆解符号",
      "durationSeconds": 8,
      "params": {
        "title": "三个物理量",
        "parts": ["F", "=", "m", "\\cdot", "a"],
        "highlight_indices": [0, 2, 4],
        "hold_seconds": 0.6
      }
    },
    {
      "type": "typewriter_text",
      "label": "口播",
      "text": "力是改变运动状态的原因，不是维持运动的原因。",
      "highlight": ["力", "运动状态"],
      "durationSeconds": 6
    },
    {
      "type": "chapter_banner",
      "label": "小结",
      "durationSeconds": 4,
      "params": {
        "chapter": "本节",
        "title": "F = ma 贯穿力学"
      }
    },
    {
      "type": "fade_text",
      "label": "金句",
      "durationSeconds": 4,
      "params": { "text": "先定义力，再谈加速度。" }
    }
  ]
}
```

## 2. 竖屏：动画 + 全程底栏实拍

```json
{
  "title": "主动回忆 60 秒",
  "aspect": "9:16",
  "autoWrap": false,
  "globalOverlay": {
    "mode": "split",
    "videoPath": "/files/uploads/scene3_demo.mp4",
    "mainRatio": 0.6,
    "overlayRatio": 0.4,
    "loop": true
  },
  "theme": {
    "primaryColor": "#fb7299",
    "backgroundColor": "#141420",
    "accentColor": "#ffe066",
    "fontPresetId": "noto-sans-sc"
  },
  "shots": [
    {
      "type": "forgetting_curve",
      "label": "遗忘曲线",
      "params": { "title": "为什么要复习？" }
    },
    {
      "type": "typewriter_text",
      "text": "合上书，先问自己：刚才学到了什么？",
      "highlight": ["合上书", "问自己"],
      "durationSeconds": 5
    },
    {
      "type": "concept_network",
      "label": "网络",
      "params": {
        "title": "主动回忆",
        "center": "提取",
        "nodes": ["间隔", "反馈", "应用"]
      }
    }
  ]
}
```

## 3. 自定义 Python（无需注册 type）

```json
{
  "type": "custom_python",
  "label": "混沌吸引子",
  "durationSeconds": 14,
  "params": {
    "class_name": "ChaosAttractorScene",
    "code": "class ChaosAttractorScene(ThreeDScene):\n    def construct(self):\n        self.set_camera_orientation(phi=70*DEGREES, theta=-40*DEGREES)\n        # ... 用户方程与轨迹 ...\n        self.begin_ambient_camera_rotation(rate=0.06)\n        self.wait(12)\n"
  }
}
```

## 反例（会仍显示案例内容）

```json
{
  "type": "manim_moving_frame_box",
  "label": "欧拉公式"
}
```

缺少 `params.parts` → 仍渲染乘积求导示例。正确写法必须带上针对「欧拉公式」的 `parts`。
