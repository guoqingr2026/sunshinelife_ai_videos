import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const ArrowAnimation: React.FC<{ primaryColor?: string; backgroundColor?: string }> = ({
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 60], [0, 1], {
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
      <svg width="600" height="100" viewBox="0 0 600 100">
        <line
          x1="50"
          y1="50"
          x2={50 + progress * 450}
          y2="50"
          stroke={primaryColor}
          strokeWidth="4"
        />
        <polygon
          points={`${50 + progress * 450},35 ${50 + progress * 450 + 20},50 ${50 + progress * 450},65`}
          fill={primaryColor}
        />
      </svg>
    </AbsoluteFill>
  );
};
