import { AbsoluteFill, Sequence, Video } from "remotion";
import { TitleAnimation } from "./TitleAnimation";
import { ParamDisplay } from "./ParamDisplay";
import { ArrowAnimation } from "./ArrowAnimation";
import { DeviceToggle } from "./DeviceToggle";
import { ChapterTransition } from "./ChapterTransition";
import { ManimPlaceholder } from "./ManimPlaceholder";
import { SubtitleBar } from "./SubtitleBar";
import { BulletList } from "./BulletList";
import { FadeText } from "./FadeText";
import { CompareCard } from "./CompareCard";

export interface TimelineItem {
  type: string;
  durationInFrames?: number;
  sourceUrl?: string;
  title?: string;
  text?: string;
  params?: Record<string, unknown>;
  items?: string[];
  leftTitle?: string;
  rightTitle?: string;
  leftText?: string;
  rightText?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  font?: string;
  logoUrl?: string;
}

export interface SimpleElectricProps {
  timeline: TimelineItem[];
  theme?: ThemeConfig;
}

export const SimpleElectric: React.FC<SimpleElectricProps> = ({
  timeline,
  theme = {},
}) => {
  const primaryColor = theme.primaryColor || "#e94560";
  const secondaryColor = theme.secondaryColor || "#0f3460";
  const backgroundColor = theme.backgroundColor || "#1a1a2e";
  let offset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {timeline.map((item, index) => {
        const duration = item.durationInFrames || 90;
        const from = offset;
        offset += duration;

        let content: React.ReactNode = null;

        switch (item.type) {
          case "title":
            content = (
              <TitleAnimation
                title={item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "params":
            content = (
              <ParamDisplay
                params={item.params}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "arrow":
            content = (
              <ArrowAnimation primaryColor={primaryColor} backgroundColor={backgroundColor} />
            );
            break;
          case "device_toggle":
            content = <DeviceToggle backgroundColor={backgroundColor} />;
            break;
          case "chapter":
            content = (
              <ChapterTransition
                chapterTitle={item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "subtitle":
            content = (
              <SubtitleBar
                text={item.text || item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "bullet_list":
            content = (
              <BulletList
                title={item.title}
                items={item.items as string[] | undefined}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "fade_text":
            content = (
              <FadeText
                text={item.text || item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "compare":
            content = (
              <CompareCard
                leftTitle={item.leftTitle}
                rightTitle={item.rightTitle}
                leftText={item.leftText}
                rightText={item.rightText}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "manim_clip":
          case "hyperframes_clip":
            if (item.sourceUrl) {
              content = (
                <Video
                  src={item.sourceUrl}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              );
            }
            break;
          case "manim_placeholder":
          case "hyperframes_placeholder":
            content = (
              <ManimPlaceholder
                title={item.title}
                description={String(
                  item.params?.说明 || item.params?.description || ""
                )}
                primaryColor={primaryColor}
              />
            );
            break;
          default:
            content = (
              <TitleAnimation title={item.type} primaryColor={primaryColor} backgroundColor={backgroundColor} />
            );
        }

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            {content}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export function calculateTotalDuration(timeline: TimelineItem[]): number {
  return timeline.reduce(
    (sum, item) => sum + (item.durationInFrames || 90),
    0
  );
}
