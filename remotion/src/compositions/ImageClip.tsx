import { AbsoluteFill, Img } from "remotion";

interface Props {
  src?: string;
  backgroundColor?: string;
}

export const ImageClip: React.FC<Props> = ({
  src,
  backgroundColor = "#141420",
}) => {
  if (!src?.trim()) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#888", fontSize: 28 }}>[image_clip: 缺少图片地址]</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <Img
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        maxRetries={5}
      />
    </AbsoluteFill>
  );
};
