import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  title?: string;
  description?: string;
  primaryColor?: string;
}

export const ManimPlaceholder: React.FC<Props> = ({
  title = "Manim 动画",
  description = "",
  primaryColor = "#e94560",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f23",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ opacity, textAlign: "center", maxWidth: 1200 }}>
        <div
          style={{
            fontSize: 28,
            color: primaryColor,
            marginBottom: 24,
            fontFamily,
          }}
        >
          [ Manim 片段 ]
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: "bold",
            color: "white",
            marginBottom: 32,
            fontFamily,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 32,
              color: "#aaa",
              lineHeight: 1.5,
              fontFamily,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
