import { AbsoluteFill, Video, useVideoConfig } from "remotion";

export interface GlobalOverlayConfig {
  mode: "split" | "pip";
  overlaySourceUrl: string;
  mainRatio?: number;
  overlayRatio?: number;
  pipPosition?: string;
  pipWidthRatio?: number;
  pipMargin?: number;
  /** 实拍短于成片时循环；默认 true（仅 globalOverlay） */
  loop?: boolean;
  backgroundColor?: string;
}

function OverlayVideo({
  src,
  loop = true,
  style,
}: {
  src: string;
  loop?: boolean;
  style: React.CSSProperties;
}) {
  return <Video src={src} loop={loop} style={style} />;
}

type PipPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

function pipStyle(
  position: PipPosition,
  margin: number,
  widthRatio: number
): React.CSSProperties {
  const width = `${Math.round(widthRatio * 100)}%`;
  const base: React.CSSProperties = {
    position: "absolute",
    width,
    aspectRatio: "16 / 9",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
    border: "2px solid rgba(255,255,255,0.85)",
    zIndex: 2,
  };

  switch (position) {
    case "top-left":
      return { ...base, top: margin, left: margin };
    case "bottom-left":
      return { ...base, bottom: margin, left: margin };
    case "bottom-right":
      return { ...base, bottom: margin, right: margin };
    case "top-right":
    default:
      return { ...base, top: margin, right: margin };
  }
}

/** 全片贯穿的实拍层：竖屏底栏分屏 或 横屏画中画 */
export const GlobalOverlayLayout: React.FC<{
  overlay: GlobalOverlayConfig;
  children: React.ReactNode;
}> = ({ overlay, children }) => {
  const { height, width } = useVideoConfig();
  const bg = overlay.backgroundColor || "#141420";
  const loopOverlay = overlay.loop !== false;

  if (overlay.mode === "pip") {
    const pos = String(overlay.pipPosition || "top-right").toLowerCase() as PipPosition;
    const safePos: PipPosition = [
      "top-right",
      "top-left",
      "bottom-right",
      "bottom-left",
    ].includes(pos)
      ? pos
      : "top-right";

    return (
      <AbsoluteFill style={{ backgroundColor: bg }}>
        {children}
        {overlay.overlaySourceUrl && (
          <div
            style={pipStyle(
              safePos,
              overlay.pipMargin ?? 24,
              overlay.pipWidthRatio ?? 0.28
            )}
          >
            <OverlayVideo
              src={overlay.overlaySourceUrl}
              loop={loopOverlay}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
      </AbsoluteFill>
    );
  }

  const ratioSum = (overlay.mainRatio ?? 0.6) + (overlay.overlayRatio ?? 0.4);
  const normMain = ratioSum > 0 ? (overlay.mainRatio ?? 0.6) / ratioSum : 0.6;
  const topH = Math.round(height * normMain);
  const bottomH = Math.max(1, height - topH);

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: topH,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {overlay.overlaySourceUrl && (
        <div
          style={{
            position: "absolute",
            top: topH,
            left: 0,
            width,
            height: bottomH,
            overflow: "hidden",
            borderTop: "2px solid rgba(255,255,255,0.15)",
          }}
        >
          <OverlayVideo
            src={overlay.overlaySourceUrl}
            loop={loopOverlay}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
