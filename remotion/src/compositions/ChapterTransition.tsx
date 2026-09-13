import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  chapterTitle?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const ChapterTransition: React.FC<Props> = ({
  chapterTitle = "第一章",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const slideX = interpolate(frame, [0, 20, 40, 60], [-100, 0, 0, 100], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 15, 45, 60], [0, 1, 1, 0], {
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
          fontSize: 56,
          fontWeight: "bold",
          color: primaryColor,
          opacity,
          transform: `translateX(${slideX}px)`,
          fontFamily,
        }}
      >
        {chapterTitle}
      </div>
    </AbsoluteFill>
  );
};
