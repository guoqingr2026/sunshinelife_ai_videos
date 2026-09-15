export const COMPOSITE_SPLIT_SHOT = {
  type: "composite_split",
  label: "竖屏分屏：Manim + 实拍",
  durationSeconds: 8,
  params: {
    mainRatio: 0.6,
    overlayRatio: 0.4,
    videoPath: "/files/uploads/scene3_demo.mp4",
    main: {
      type: "typewriter_text",
      text: "主画面口播文案（Manim 动画区）",
      highlight: ["主画面"],
      subtitle: "上 60%",
    },
  },
};

export const COMPOSITE_PIP_SHOT = {
  type: "composite_pip",
  label: "横屏画中画",
  durationSeconds: 8,
  params: {
    pipPosition: "top-right",
    pipWidthRatio: 0.28,
    pipMargin: 24,
    videoPath: "/files/uploads/scene3_demo.mp4",
    main: {
      type: "typewriter_text",
      text: "全屏 Manim 主画面",
      highlight: [],
      subtitle: "画中画在右上角",
    },
  },
};

export function appendShotToProjectJson(
  projectJson: string,
  shot: Record<string, unknown>,
  options?: { aspect?: "16:9" | "9:16" }
): string {
  const obj = JSON.parse(projectJson) as Record<string, unknown>;
  const shots = Array.isArray(obj.shots) ? [...obj.shots] : [];
  shots.push(shot);
  obj.shots = shots;
  if (options?.aspect) obj.aspect = options.aspect;
  return JSON.stringify(obj, null, 2);
}

export const COMPOSITE_PRESET_HELP = `composite_split（9:16 竖屏）
  params.mainRatio / overlayRatio — 上下占比（默认 0.6 / 0.4）
  params.videoPath — 下方实拍视频 /files/uploads/...
  params.main — 嵌套 Manim 镜头（type + text/params）

composite_pip（16:9 横屏）
  params.pipPosition — top-right | top-left | bottom-right | bottom-left
  params.pipWidthRatio — 小窗宽度占比（默认 0.28）
  params.pipMargin — 边距像素（默认 24）
  params.videoPath — 画中画视频路径`;
