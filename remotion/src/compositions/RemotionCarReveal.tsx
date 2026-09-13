import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  door?: string;
  effect?: string;
  text?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
}

export const RemotionCarReveal: React.FC<Props> = ({
  door = "2号门",
  effect = "burst_light",
  text = "换门 → 赢得汽车！",
  primaryColor = "#e94560",
  accentColor = "#ffd166",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const burst = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const carScale = interpolate(frame, [20, 50], [0.3, 1], { extrapolateRight: "clamp" });
  const textOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: "clamp" });
  const glowSize = effect === "burst_light" ? 200 + burst * 120 : 120;

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: glowSize,
          height: glowSize,
          marginLeft: -glowSize / 2,
          marginTop: -glowSize / 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}88 0%, transparent 70%)`,
          opacity: burst * 0.8,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div style={{ fontSize: 28, color: "#aaa", marginBottom: 24 }}>{door}</div>
        <div
          style={{
            fontSize: 120,
            transform: `scale(${carScale})`,
            filter: `drop-shadow(0 0 ${20 + burst * 30}px ${accentColor})`,
          }}
        >
          🚗
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: "bold",
            color: primaryColor,
            marginTop: 40,
            opacity: textOpacity,
            textAlign: "center",
            padding: "0 48px",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
