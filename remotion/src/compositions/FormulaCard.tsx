import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  formula?: string;
  caption?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const FormulaCard: React.FC<Props> = ({
  formula = "E = mc²",
  caption = "核心公式",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          padding: "48px 80px",
          borderRadius: 16,
          border: `2px solid ${primaryColor}`,
          backgroundColor: "rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, color: "#aaa", marginBottom: 20, fontFamily: "sans-serif" }}>
          {caption}
        </div>
        <div style={{ fontSize: 72, color: "white", fontFamily: "serif" }}>{formula}</div>
      </div>
    </AbsoluteFill>
  );
};
