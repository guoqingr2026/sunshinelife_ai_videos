import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  text?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const FadeText: React.FC<Props> = ({
  text = "过渡说明文字",
  primaryColor = "#e94560",
  backgroundColor = "#16213e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25, 75, 90], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 120,
      }}
    >
      <div
        style={{
          opacity,
          fontSize: 44,
          lineHeight: 1.6,
          color: "white",
          textAlign: "center",
          fontFamily,
          borderTop: `3px solid ${primaryColor}`,
          borderBottom: `3px solid ${primaryColor}`,
          padding: "40px 0",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
