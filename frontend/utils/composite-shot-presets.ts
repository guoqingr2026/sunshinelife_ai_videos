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

export const GLOBAL_OVERLAY_SPLIT = {
  mode: "split",
  videoPath: "/files/uploads/scene3_demo.mp4",
  mainRatio: 0.6,
  overlayRatio: 0.4,
  loop: true,
};

export const GLOBAL_OVERLAY_PIP = {
  mode: "pip",
  videoPath: "/files/uploads/scene3_demo.mp4",
  pipPosition: "bottom-right",
  pipWidthRatio: 0.32,
  pipMargin: 24,
  loop: true,
};

export function applyGlobalOverlayToProjectJson(
  projectJson: string,
  overlay: Record<string, unknown>,
  options?: { aspect?: "16:9" | "9:16" }
): string {
  const obj = JSON.parse(projectJson) as Record<string, unknown>;
  obj.globalOverlay = overlay;
  if (options?.aspect) obj.aspect = options.aspect;
  return JSON.stringify(obj, null, 2);
}

export const COMPOSITE_PRESET_HELP = `globalOverlay（推荐：全片贯穿实拍，从开头到结尾）
  project.globalOverlay.mode — split（竖屏底栏）| pip（横屏画中画）
  project.globalOverlay.videoPath — /files/uploads/...
  split: mainRatio / overlayRatio（默认 0.6 / 0.4），aspect 建议 9:16
  pip: pipPosition / pipWidthRatio / pipMargin，aspect 建议 16:9
  loop — 实拍短于成片时自动循环（默认 true；设 false 则停在最后一帧）
  shots[] 写普通镜头即可，勿再单独加 composite_split

composite_split（单镜分屏，仅该镜头时长）
  params.mainRatio / overlayRatio — 上下占比（默认 0.6 / 0.4）
  params.videoPath — 下方实拍视频 /files/uploads/...
  params.main — 嵌套 Manim 镜头（type + text/params）

composite_pip（单镜画中画）
  params.pipPosition — top-right | top-left | bottom-right | bottom-left
  params.pipWidthRatio — 小窗宽度占比（默认 0.28）
  params.pipMargin — 边距像素（默认 24）
  params.videoPath — 画中画视频路径`;
