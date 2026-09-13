import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

export const DeviceToggle: React.FC<{ backgroundColor?: string }> = ({
  backgroundColor = "#0f0f23",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const isOn = frame > 30;
  const glow = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          width: 120,
          height: 120,
          borderRadius: 20,
          backgroundColor: isOn ? "#e94560" : "#333",
          boxShadow: isOn ? `0 0 ${glow * 40}px #e94560` : "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          color: "white",
          fontFamily,
          transition: "none",
        }}
      >
        {isOn ? "ON" : "OFF"}
      </div>
    </AbsoluteFill>
  );
};
