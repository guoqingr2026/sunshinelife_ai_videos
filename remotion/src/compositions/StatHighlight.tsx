import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  value?: string;
  label?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const StatHighlight: React.FC<Props> = ({
  value = "80%",
  label = "记忆留存",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ opacity, textAlign: "center" }}>
        <div style={{ fontSize: 120, fontWeight: "bold", color: primaryColor, fontFamily: "sans-serif" }}>
          {value}
        </div>
        <div style={{ fontSize: 36, color: "#ccc", marginTop: 16, fontFamily: "sans-serif" }}>
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
