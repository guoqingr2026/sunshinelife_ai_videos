import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  text?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const SubtitleBar: React.FC<Props> = ({
  text = "字幕内容",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const slideY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          right: 60,
          opacity,
          transform: `translateY(${slideY}px)`,
          backgroundColor: "rgba(0,0,0,0.55)",
          borderLeft: `6px solid ${primaryColor}`,
          padding: "24px 32px",
          fontSize: 36,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
