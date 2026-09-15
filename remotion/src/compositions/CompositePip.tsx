import { AbsoluteFill, Video } from "remotion";

type PipPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

interface Props {
  mainSourceUrl?: string;
  overlaySourceUrl?: string;
  pipPosition?: PipPosition | string;
  pipWidthRatio?: number;
  pipMargin?: number;
  backgroundColor?: string;
}

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

export const CompositePip: React.FC<Props> = ({
  mainSourceUrl,
  overlaySourceUrl,
  pipPosition = "top-right",
  pipWidthRatio = 0.28,
  pipMargin = 24,
  backgroundColor = "#141420",
}) => {
  const pos = String(pipPosition || "top-right").toLowerCase() as PipPosition;
  const safePos: PipPosition = [
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ].includes(pos)
    ? pos
    : "top-right";

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {mainSourceUrl && (
        <Video
          src={mainSourceUrl}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
      {overlaySourceUrl && (
        <div style={pipStyle(safePos, pipMargin, pipWidthRatio)}>
          <Video
            src={overlaySourceUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
