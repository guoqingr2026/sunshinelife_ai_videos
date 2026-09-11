import fs from "fs";
import path from "path";
import { generateImage } from "./image_client";

const STYLE_PROMPTS: Record<string, string> = {
  handdrawn:
    "Hand-drawn sketch style, pencil lines, educational diagram, white background:",
  ui: "Clean modern UI style, flat design, tech illustration, dark theme:",
  engineering:
    "Technical engineering schematic, precise lines, labeled components, blueprint style:",
};

export interface HyperFramesConfig {
  prompt: string;
  duration: number;
  fps: number;
  style: "handdrawn" | "ui" | "engineering";
  keyframeInterval?: number;
}

export async function generateFrames(
  _taskId: string,
  config: HyperFramesConfig,
  outputDir: string
): Promise<{ frameCount: number; keyframeCount: number }> {
  fs.mkdirSync(outputDir, { recursive: true });

  const totalFrames = Math.ceil(config.duration * config.fps);
  const interval = config.keyframeInterval || 15;
  const stylePrefix = STYLE_PROMPTS[config.style] || STYLE_PROMPTS.handdrawn;

  const keyframeIndices: number[] = [];
  for (let i = 0; i < totalFrames; i += interval) {
    keyframeIndices.push(i);
  }
  if (keyframeIndices[keyframeIndices.length - 1] !== totalFrames - 1) {
    keyframeIndices.push(totalFrames - 1);
  }

  const keyframeBuffers: Map<number, Buffer> = new Map();
  const concurrency = 3;

  for (let i = 0; i < keyframeIndices.length; i += concurrency) {
    const batch = keyframeIndices.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (frameIdx) => {
        const progress = frameIdx / totalFrames;
        const framePrompt = `${stylePrefix} ${config.prompt}. Frame ${frameIdx + 1}/${totalFrames}, progress ${Math.round(progress * 100)}%.`;
        const buffer = await generateImage(framePrompt);
        return { frameIdx, buffer };
      })
    );
    for (const { frameIdx, buffer } of results) {
      keyframeBuffers.set(frameIdx, buffer);
    }
  }

  const sortedKeyframes = Array.from(keyframeBuffers.entries()).sort(
    (a, b) => a[0] - b[0]
  );

  for (let i = 0; i < totalFrames; i++) {
    let buffer: Buffer | undefined;
    for (let k = 0; k < sortedKeyframes.length; k++) {
      const [kfIdx, kfBuffer] = sortedKeyframes[k];
      const nextKf = sortedKeyframes[k + 1];
      if (i >= kfIdx && (!nextKf || i < nextKf[0])) {
        buffer = kfBuffer;
        break;
      }
    }
    if (!buffer) buffer = sortedKeyframes[0][1];

    const framePath = path.join(
      outputDir,
      `frame_${String(i + 1).padStart(4, "0")}.png`
    );
    fs.writeFileSync(framePath, buffer);
  }

  return { frameCount: totalFrames, keyframeCount: keyframeIndices.length };
}
