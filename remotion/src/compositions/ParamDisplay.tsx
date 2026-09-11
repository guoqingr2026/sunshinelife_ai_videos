import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  params?: Record<string, unknown>;
  primaryColor?: string;
  backgroundColor?: string;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

export const ParamDisplay: React.FC<Props> = ({
  params = { voltage: "9V", current: "1A", resistance: "9Ω" },
  primaryColor = "#0f3460",
  backgroundColor = "#16213e",
}) => {
  const frame = useCurrentFrame();
  const entries = Object.entries(params);

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {entries.map(([key, value], i) => {
        const delay = i * 15;
        const opacity = interpolate(
          frame,
          [delay, delay + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={key}
            style={{
              opacity,
              fontSize: 48,
              color: "white",
              fontFamily: "monospace",
              borderLeft: `4px solid ${primaryColor}`,
              paddingLeft: 20,
            }}
          >
            {key}: <span style={{ color: primaryColor }}>{formatValue(value)}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
