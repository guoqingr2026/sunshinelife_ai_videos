import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  steps?: string[];
  primaryColor?: string;
  backgroundColor?: string;
}

export const FlowSteps: React.FC<Props> = ({
  steps = ["输入", "理解", "回忆", "应用"],
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {steps.map((step, i) => {
          const start = i * 12;
          const opacity = interpolate(frame, [start, start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: primaryColor,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: "bold",
                  fontFamily: "sans-serif",
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 32, color: "white", fontFamily: "sans-serif" }}>{step}</div>
              {i < steps.length - 1 && (
                <div style={{ fontSize: 28, color: primaryColor, marginLeft: 8 }}>→</div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
