import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  quote?: string;
  author?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const QuoteCard: React.FC<Props> = ({
  quote = "理解优先于记忆",
  author = "",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 25], [0.95, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          maxWidth: 1100,
          borderLeft: `6px solid ${primaryColor}`,
          paddingLeft: 40,
        }}
      >
        <div style={{ fontSize: 48, color: "white", lineHeight: 1.5, fontFamily }}>
          “{quote}”
        </div>
        {author && (
          <div style={{ fontSize: 28, color: primaryColor, marginTop: 24, fontFamily }}>
            — {author}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
