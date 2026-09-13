import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  title?: string;
  subtitle?: string;
  doors?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

export const RemotionDoors: React.FC<Props> = ({
  title = "蒙提霍尔悖论",
  subtitle = "",
  doors = ["1号门", "2号门", "3号门"],
  primaryColor = "#e94560",
  secondaryColor = "#0f3460",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      <div style={{ textAlign: "center", paddingTop: 80, opacity: titleOpacity }}>
        <div style={{ fontSize: 48, fontWeight: "bold", color: primaryColor }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 28, color: "#aaa", marginTop: 16 }}>{subtitle}</div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 48,
          height: "100%",
          paddingBottom: 120,
        }}
      >
        {doors.map((label, i) => {
          const start = 25 + i * 15;
          const scale = interpolate(frame, [start, start + 20], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const opacity = interpolate(frame, [start, start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{ textAlign: "center", opacity, transform: `scale(${scale})` }}>
              <div
                style={{
                  width: 160,
                  height: 240,
                  background: `linear-gradient(180deg, ${secondaryColor} 0%, #0a0a14 100%)`,
                  border: `4px solid ${primaryColor}`,
                  borderRadius: 8,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 64, color: primaryColor, fontWeight: "bold" }}>?</span>
              </div>
              <div style={{ fontSize: 24, color: "white", marginTop: 16 }}>{label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
