import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useThemeFont } from "../theme-font";

interface Props {
  selectedDoor?: string;
  openedDoor?: string;
  reveal?: string;
  text?: string;
  doors?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

export const RemotionOpenDoor: React.FC<Props> = ({
  selectedDoor = "1号门",
  openedDoor = "3号门",
  reveal = "goat",
  text = "",
  doors = ["1号门", "2号门", "3号门"],
  primaryColor = "#e94560",
  secondaryColor = "#0f3460",
  backgroundColor = "#1a1a2e",
}) => {
  const { fontFamily } = useThemeFont();
  const frame = useCurrentFrame();
  const openProgress = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const captionOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });

  const revealLabel = reveal === "goat" ? "🐐 山羊" : reveal === "car" ? "🚗 汽车" : reveal;

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 48,
          height: "100%",
        }}
      >
        {doors.map((label) => {
          const isSelected = label === selectedDoor;
          const isOpened = label === openedDoor;
          const doorAngle = isOpened ? openProgress * 75 : 0;
          return (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", width: 160, height: 240 }}>
                <div
                  style={{
                    width: 160,
                    height: 240,
                    background: `linear-gradient(180deg, ${secondaryColor} 0%, #0a0a14 100%)`,
                    border: `4px solid ${isSelected ? primaryColor : "#444"}`,
                    borderRadius: 8,
                    transform: `perspective(400px) rotateY(-${doorAngle}deg)`,
                    transformOrigin: "left center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected ? `0 0 24px ${primaryColor}` : undefined,
                  }}
                >
                  {isOpened && openProgress > 0.3 ? (
                    <span style={{ fontSize: 48 }}>{revealLabel}</span>
                  ) : (
                    <span style={{ fontSize: 48, color: primaryColor }}>?</span>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: isSelected ? primaryColor : "white",
                  marginTop: 12,
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {label}
                {isSelected ? " ✓" : ""}
              </div>
            </div>
          );
        })}
      </div>
      {text && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 32,
            color: "white",
            opacity: captionOpacity,
            padding: "0 48px",
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};
