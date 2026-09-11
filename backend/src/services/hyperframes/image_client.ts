import OpenAI from "openai";

export async function generateImage(
  prompt: string,
  size = "1024x1024"
): Promise<Buffer> {
  const imageApiUrl = process.env.IMAGE_API_URL || process.env.OPENAI_BASE_URL;
  const imageApiKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;
  const imageModel = process.env.IMAGE_MODEL || "dall-e-3";

  if (!imageApiKey) {
    return generatePlaceholderImage();
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
