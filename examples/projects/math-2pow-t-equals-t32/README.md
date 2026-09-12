# 实战示例：指数方程 2^t = t^32

一道网红奥数指数题的完整「一键成片」项目，含题目配图、中文字幕稿与分镜 JSON。

## 题目

$$2^t = t^{32}, \quad t = ?$$

**答案：** $t = 256$

## 文件说明

| 文件 | 用途 |
|------|------|
| `project.json` | 粘贴到「一键成片」项目 JSON 框 |
| `narration-zh.md` | 中文旁白稿（科普讲解） |
| `subtitles-zh.srt` | 中文字幕（可导入剪辑软件） |
| `manim/assets/math-problem-t32.png` | 题目手写图（image_focus 用） |

## 使用步骤

1. 打开 **配置 → 一键成片**
2. 点击 **「加载数学题示例」**（或复制 `project.json` 内容）
3. 建议勾选「自动合成最终成片」
4. 点击 **一键生成视频**
5. 完成后下载 **成片 MP4** 和 **output 工程包 (.zip)**

## 推荐 Remotion 主题（compose 时可选）

```json
{
  "primaryColor": "#a855f7",
  "secondaryColor": "#312e81",
  "backgroundColor": "#1e1b2e",
  "accentColor": "#f472b6",
  "name": "学术紫"
}
```

## 分镜结构（18 镜）

开场 title → 题目图 → 原方程 → 思路 → 两步推导 → 法则 → 关键式 → 流程 → 答案 → 验证 → 总结 → 结尾

## ECS 注意

- MathTex 清晰显示：`sudo bash deploy/ecs/install-texlive-optional.sh`
- 题目图已放在 `manim/assets/math-problem-t32.png`
