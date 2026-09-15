import { AbsoluteFill, Img, Sequence, Video } from "remotion";
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
import { QuoteCard } from "./QuoteCard";
import { StatHighlight } from "./StatHighlight";
import { FlowSteps } from "./FlowSteps";
import { TimelineBar } from "./TimelineBar";
import { FormulaCard } from "./FormulaCard";
import { RemotionDoors } from "./RemotionDoors";
import { RemotionOpenDoor } from "./RemotionOpenDoor";
import { RemotionCarReveal } from "./RemotionCarReveal";
import { ThemeFontProvider, resolveRemotionFontFamily } from "../theme-font";

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
  quote?: string;
  author?: string;
  value?: string;
  label?: string;
  steps?: string[];
  events?: string[];
  formula?: string;
  caption?: string;
  manimType?: string;
  note?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  font?: string;
  fontFamily?: string;
  fontPresetId?: string;
  manimCjkFont?: string;
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
  const fontFamily = resolveRemotionFontFamily(theme);
  let offset = 0;

  return (
    <ThemeFontProvider fontFamily={fontFamily}>
    <AbsoluteFill style={{ backgroundColor, fontWeight: 700 }}>
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
          case "image_clip":
            if (item.sourceUrl) {
              content = (
                <AbsoluteFill style={{ backgroundColor }}>
                  <Img
                    src={item.sourceUrl}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </AbsoluteFill>
              );
            }
            break;
          case "quote":
            content = (
              <QuoteCard
                quote={item.quote || item.text}
                author={item.author}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "stat":
            content = (
              <StatHighlight
                value={item.value}
                label={item.label || item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "flow_steps":
            content = (
              <FlowSteps
                steps={item.steps as string[] | undefined}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "timeline_bar":
            content = (
              <TimelineBar
                events={item.events as string[] | undefined}
                title={item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "formula_card":
            content = (
              <FormulaCard
                formula={item.formula}
                caption={item.caption || item.title}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "remotion_doors":
            content = (
              <RemotionDoors
                title={(item.params?.title as string) || item.title}
                subtitle={item.params?.subtitle as string}
                doors={item.params?.doors as string[]}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "remotion_open_door":
            content = (
              <RemotionOpenDoor
                selectedDoor={item.params?.selectedDoor as string}
                openedDoor={item.params?.openedDoor as string}
                reveal={item.params?.reveal as string}
                text={item.params?.text as string}
                doors={item.params?.doors as string[]}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "remotion_car_reveal":
            content = (
              <RemotionCarReveal
                door={item.params?.door as string}
                effect={item.params?.effect as string}
                text={item.params?.text as string}
                primaryColor={primaryColor}
                accentColor={theme.accentColor || "#ffd166"}
                backgroundColor={backgroundColor}
              />
            );
            break;
          case "manim_placeholder":
          case "hyperframes_placeholder":
            content = (
              <ManimPlaceholder
                title={item.title}
                description={[
                  item.manimType ? `Manim 类型: ${item.manimType}` : "",
                  item.note || "",
                  String(item.params?.说明 || item.params?.description || ""),
                ]
                  .filter(Boolean)
                  .join(" · ")}
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
    </ThemeFontProvider>
  );
};

export function calculateTotalDuration(timeline: TimelineItem[]): number {
  return timeline.reduce(
    (sum, item) => sum + (item.durationInFrames || 90),
    0
  );
}
