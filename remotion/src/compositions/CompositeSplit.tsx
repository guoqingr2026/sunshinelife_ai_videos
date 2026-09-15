import { AbsoluteFill, useVideoConfig, Video } from "remotion";

interface Props {
  mainSourceUrl?: string;
  overlaySourceUrl?: string;
  mainRatio?: number;
  overlayRatio?: number;
  backgroundColor?: string;
}

export const CompositeSplit: React.FC<Props> = ({
  mainSourceUrl,
  overlaySourceUrl,
  mainRatio = 0.6,
  overlayRatio = 0.4,
  backgroundColor = "#141420",
}) => {
  const { height, width } = useVideoConfig();
  const ratioSum = mainRatio + overlayRatio;
  const normMain = ratioSum > 0 ? mainRatio / ratioSum : 0.6;
  const topH = Math.round(height * normMain);
  const bottomH = Math.max(1, height - topH);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {mainSourceUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height: topH,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Video
            src={mainSourceUrl}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      )}
      {overlaySourceUrl && (
        <div
          style={{
            position: "absolute",
            top: topH,
            left: 0,
            width,
            height: bottomH,
            overflow: "hidden",
            borderTop: "2px solid rgba(255,255,255,0.15)",
          }}
        >
          <Video
            src={overlaySourceUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      {!overlaySourceUrl && (
        <div
          style={{
            position: "absolute",
            top: topH,
            width: "100%",
            height: bottomH,
            color: "#888",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          [缺少 overlay 视频]
        </div>
      )}
    </AbsoluteFill>
  );
};
