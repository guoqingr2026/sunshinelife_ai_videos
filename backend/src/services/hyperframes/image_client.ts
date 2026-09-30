import OpenAI from "openai";
import { resolveSecret } from "../../lib/resolve-secret";
import { applyProxyEnv } from "../llm/openrouter-chat";

export function getImageApiConfig(): {
  imageApiKey: string | undefined;
  imageApiUrl: string | undefined;
  imageModel: string;
  provider: "openrouter" | "openai" | "custom" | "none";
} {
  applyProxyEnv();
  const openrouterKey = resolveSecret("OPENROUTER_API_KEY");
  const dedicated =
    process.env.IMAGE_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  const useOpenRouter = !dedicated && !!openrouterKey;
  const imageApiKey = dedicated || openrouterKey;
  const imageApiUrl =
    process.env.IMAGE_API_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    (useOpenRouter ? "https://openrouter.ai/api/v1" : undefined);
  const imageModel =
    process.env.IMAGE_MODEL?.trim() ||
    process.env.OPENROUTER_IMAGE_MODEL?.trim() ||
    (useOpenRouter ? "black-forest-labs/flux.1-schnell" : "dall-e-3");
  const provider = !imageApiKey
    ? "none"
    : useOpenRouter
      ? "openrouter"
      : process.env.IMAGE_API_URL || process.env.OPENAI_BASE_URL
        ? "custom"
        : "openai";
  return { imageApiKey, imageApiUrl, imageModel, provider };
}

export async function generateImage(
  prompt: string,
  size = "1024x1024"
): Promise<Buffer> {
  const { imageApiKey, imageApiUrl, imageModel } = getImageApiConfig();

  if (!imageApiKey) {
    return generatePlaceholderImage();
  }

  const client = new OpenAI({
    apiKey: imageApiKey,
    baseURL: imageApiUrl,
    defaultHeaders:
      imageApiUrl?.includes("openrouter.ai")
        ? {
            "HTTP-Referer":
              process.env.PUBLIC_SITE_URL ||
              "http://47.99.184.249/sunshinelife_ai_videos/",
            "X-Title": "SunshineLife HyperFrames",
          }
        : undefined,
  });

  const response = await client.images.generate({
    model: imageModel,
    prompt,
    n: 1,
    size: size as "1024x1024",
    response_format: "b64_json",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data returned");
  return Buffer.from(b64, "base64");
}

function generatePlaceholderImage(): Buffer {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGElEQVQYV2NkYGD4z8DAwMgABXAGjQAAfQABfQABfQAAAABJRU5ErkJggg==",
    "base64"
  );
}
