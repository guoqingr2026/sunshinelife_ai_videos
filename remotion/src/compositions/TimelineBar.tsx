import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  events?: string[];
  title?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export const TimelineBar: React.FC<Props> = ({
  events = ["T0", "T1", "T2", "T3"],
  title = "时间轴",
  primaryColor = "#e94560",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const lineWidth = interpolate(frame, [10, 40], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div style={{ width: "90%", maxWidth: 1200 }}>
        <div style={{ fontSize: 40, color: "white", marginBottom: 48, fontFamily }}>
          {title}
        </div>
        <div style={{ position: "relative", height: 80 }}>
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 0,
              height: 4,
              width: `${lineWidth}%`,
              backgroundColor: primaryColor,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
            {events.map((ev, i) => {
              const start = 20 + i * 10;
              const opacity = interpolate(frame, [start, start + 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ textAlign: "center", opacity, flex: 1 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: primaryColor,
                      margin: "0 auto 12px",
                    }}
                  />
                  <div style={{ fontSize: 24, color: "#ddd", fontFamily }}>{ev}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
