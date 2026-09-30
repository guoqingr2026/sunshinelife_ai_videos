import { chatCompletion } from "../llm/openrouter-chat";
import { parseShotPlanArticle, extractJsonString } from "./shot-plan-parser";
import { buildGptPrompt } from "./shot-plan-spec";
import type { ParsedShotPlan } from "./shot-plan-parser";

const SYSTEM_SUFFIX = `

额外硬性要求：
1. JSON 根对象必须包含 \`"renderQuality": "high"\`
2. \`aspect\` 默认 \`"16:9"\`（竖屏选题才用 9:16）
3. 只输出一个 \`\`\`json ... \`\`\` 代码块，不要前言后语`;

function wrapAsArticle(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes("```")) return trimmed;
  return `\`\`\`json\n${trimmed}\n\`\`\``;
}

function ensureRenderQualityInArticle(article: string): string {
  const jsonStr = extractJsonString(article);
  if (!jsonStr) return article;
  try {
    const data = JSON.parse(jsonStr) as Record<string, unknown>;
    if (data.renderQuality !== "high") {
      data.renderQuality = "high";
    }
    if (!data.aspect) data.aspect = "16:9";
    const block = JSON.stringify(data, null, 2);
    if (article.includes("```")) {
      return article.replace(/```(?:json)?\s*[\s\S]*?```/i, `\`\`\`json\n${block}\n\`\`\``);
    }
    return `\`\`\`json\n${block}\n\`\`\``;
  } catch {
    return article;
  }
}

export async function generateShotPlanFromTopic(
  topic: string,
  model?: string
): Promise<{ article: string; preview: ParsedShotPlan; model: string; raw: string }> {
  const subject = topic.trim();
  if (!subject) {
    throw new Error("选题不能为空");
  }

  const system = buildGptPrompt() + SYSTEM_SUFFIX;
  const user = `请为以下科普视频选题生成完整一键成片项目 JSON：

选题：${subject}

要求 shots 8～18 个，含 typewriter_text 口播与 2～4 个 Manim 动画镜头，theme 使用 B站粉配色。`;

  const { text, model: usedModel } = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model
  );

  let article = ensureRenderQualityInArticle(wrapAsArticle(text));
  let preview = parseShotPlanArticle(article);

  if (preview.errors.length > 0 || preview.shots.length === 0) {
    const retryUser = `${user}

上次输出无法解析，请只输出合法 JSON 代码块，确保 shots 为非空数组。`;
    const retry = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: retryUser },
      ],
      model || usedModel
    );
    article = ensureRenderQualityInArticle(wrapAsArticle(retry.text));
    preview = parseShotPlanArticle(article);
  }

  return { article, preview, model: usedModel, raw: text };
}
