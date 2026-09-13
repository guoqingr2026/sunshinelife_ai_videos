import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  title?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const TitleAnimation: React.FC<Props> = ({
  title = "工程动画",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: "clamp" });

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
          fontSize: 72,
          fontWeight: "bold",
          color: primaryColor,
          opacity,
          transform: `scale(${scale})`,
          fontFamily,
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};
