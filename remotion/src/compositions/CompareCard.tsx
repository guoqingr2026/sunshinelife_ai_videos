import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  leftTitle?: string;
  rightTitle?: string;
  leftText?: string;
  rightText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

export const CompareCard: React.FC<Props> = ({
  leftTitle = "Before",
  rightTitle = "After",
  leftText = "旧方法",
  rightText = "新方法",
  primaryColor = "#e94560",
  secondaryColor = "#0f3460",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor, padding: 80 }}>
      <div style={{ display: "flex", gap: 40, height: "100%" }}>
        <div
          style={{
            flex: 1,
            opacity: progress,
            backgroundColor: secondaryColor,
            borderRadius: 16,
            padding: 40,
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 40, color: "#aaa", marginBottom: 20 }}>{leftTitle}</div>
          <div style={{ fontSize: 48, color: "white" }}>{leftText}</div>
        </div>
        <div
          style={{
            flex: 1,
            opacity: progress,
            backgroundColor: primaryColor,
            borderRadius: 16,
            padding: 40,
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 40, color: "rgba(255,255,255,0.8)", marginBottom: 20 }}>
            {rightTitle}
          </div>
          <div style={{ fontSize: 48, color: "white" }}>{rightText}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
