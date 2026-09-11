const STYLE_LABELS: Record<string, string> = {
  engineering: "工程科普",
  casual: "轻松有趣",
  academic: "学术严谨",
};

export function buildPackagingPrompt(subtitleText: string, style = "engineering"): string {
  const styleLabel = STYLE_LABELS[style] || style;
  return `你是 B 站科技/工程类视频包装文案专家。请根据以下字幕，写一份可直接使用的视频包装文案。

风格：${styleLabel}

需要包含：
1. 标题（吸引人、适合 B 站）
2. 简介（含话题标签）
3. 前 3 秒口播钩子
4. 封面大字 + 封面小字

字幕内容：
---
${subtitleText.trim()}
---

请直接输出完整文案，分块清晰，方便复制到 B 站后台。`;
}
