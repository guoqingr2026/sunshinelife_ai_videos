import OpenAI from "openai";
import { resolveSecret } from "../../lib/resolve-secret";
import { applyProxyEnv } from "../llm/openrouter-chat";

/** OpenRouter dedicated image API (not /v1/images/generations). */
const OPENROUTER_IMAGES_URL = "https://openrouter.ai/api/v1/images";

/** OpenRouter 图像目录中 image_output=0 的模型优先（2026-03 实测）。 */
const OPENROUTER_IMAGE_FALLBACKS = [
  "inclusionai/ming-image-0.1-design",
  "inclusionai/ming-image-0.1-design-layer",
  "recraft/recraft-v4.1-flash",
  "bytedance-seed/seedream-5-0-lite",
  "bytedance-seed/seedream-4.5",
];

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
    (useOpenRouter ? OPENROUTER_IMAGE_FALLBACKS[0] : "dall-e-3");
  const provider = !imageApiKey
    ? "none"
    : useOpenRouter
      ? "openrouter"
      : process.env.IMAGE_API_URL || process.env.OPENAI_BASE_URL
        ? "custom"
        : "openai";
  return { imageApiKey, imageApiUrl, imageModel, provider };
}

function openRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer":
      process.env.PUBLIC_SITE_URL ||
      "http://47.99.184.249/sunshinelife_ai_videos/",
    "X-Title": "SunshineLife HyperFrames",
  };
}

async function generateOpenRouterImage(
  prompt: string,
  apiKey: string,
  preferredModel: string
): Promise<Buffer> {
  const models = [
    preferredModel,
    ...OPENROUTER_IMAGE_FALLBACKS.filter((m) => m !== preferredModel),
  ];

  let lastError = "OpenRouter image generation failed";

  for (const model of models) {
    const res = await fetch(OPENROUTER_IMAGES_URL, {
      method: "POST",
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model,
        prompt,
        aspect_ratio: "1:1",
        resolution: "1K",
        n: 1,
      }),
    });

    const body = (await res.json()) as {
      error?: { message?: string; code?: number };
      data?: Array<{ b64_json?: string; url?: string }>;
    };

    if (!res.ok) {
      lastError = body.error?.message || res.statusText;
      if (res.status === 404 || /no model found/i.test(lastError)) {
        continue;
      }
      throw new Error(`${lastError} (model: ${model})`);
    }

    const b64 = body.data?.[0]?.b64_json;
    if (b64) return Buffer.from(b64, "base64");

    const url = body.data?.[0]?.url;
    if (url) {
      const img = await fetch(url);
      if (!img.ok) throw new Error(`Failed to download image from ${url}`);
      return Buffer.from(await img.arrayBuffer());
    }

    lastError = `No image data (model: ${model})`;
  }

  throw new Error(lastError);
}

export async function generateImage(
  prompt: string,
  size = "1024x1024"
): Promise<Buffer> {
  const { imageApiKey, imageApiUrl, imageModel, provider } = getImageApiConfig();

  if (!imageApiKey) {
    return generatePlaceholderImage();
  }

  if (provider === "openrouter") {
    return generateOpenRouterImage(prompt, imageApiKey, imageModel);
  }

  const client = new OpenAI({
    apiKey: imageApiKey,
    baseURL: imageApiUrl,
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
