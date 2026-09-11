import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  items?: string[];
  title?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const BulletList: React.FC<Props> = ({
  items = ["要点一", "要点二", "要点三"],
  title = "核心要点",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        padding: 100,
      }}
    >
      <div style={{ fontSize: 48, color: primaryColor, marginBottom: 40, fontFamily: "sans-serif" }}>
        {title}
      </div>
      {items.map((item, i) => {
        const delay = i * 12;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              opacity,
              fontSize: 34,
              color: "white",
              marginBottom: 20,
              fontFamily: "sans-serif",
              display: "flex",
              gap: 16,
            }}
          >
            <span style={{ color: primaryColor }}>●</span>
            <span>{item}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
