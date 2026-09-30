import OpenAI from "openai";

export interface LlmConfigStatus {
  configured: boolean;
  model: string;
  proxy: string | null;
  baseUrl: string;
}

export function getLlmConfig(): {
  apiKey: string | undefined;
  proxy: string | undefined;
  model: string;
  baseUrl: string;
} {
  const apiKey =
    process.env.OPENROUTER_API_KEY?.trim() ||
    process.env.FREE_LLM_OPENROUTER_API_KEYS?.split(/[,;\s]+/)[0]?.trim();
  const proxy =
    process.env.LLM_HTTP_PROXY?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.PROXY_URL?.trim();
  const model =
    process.env.FREE_LLM_MODEL?.trim() || "openrouter/openrouter/free";
  const baseUrl =
    process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1";
  return { apiKey, proxy, model, baseUrl };
}

/** Apply proxy env for runtimes that honor HTTPS_PROXY (Node fetch / undici). */
export function applyProxyEnv(): void {
  const { proxy } = getLlmConfig();
  if (!proxy) return;
  process.env.HTTPS_PROXY = proxy;
  process.env.HTTP_PROXY = proxy;
  process.env.ALL_PROXY = proxy;
}

export function getLlmConfigStatus(): LlmConfigStatus {
  applyProxyEnv();
  const { apiKey, proxy, model, baseUrl } = getLlmConfig();
  return {
    configured: Boolean(apiKey),
    model,
    proxy: proxy || null,
    baseUrl,
  };
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

let client: OpenAI | null = null;

function getClient(): OpenAI {
  applyProxyEnv();
  const { apiKey, baseUrl } = getLlmConfig();
  if (!apiKey) {
    throw new Error(
      "未配置 OPENROUTER_API_KEY。请在服务器 .env 中设置（OpenRouter 免费 Key）。"
    );
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: baseUrl.replace(/\/$/, ""),
      defaultHeaders: {
        "HTTP-Referer":
          process.env.PUBLIC_SITE_URL ||
          "http://47.99.184.249/sunshinelife_ai_videos/",
        "X-Title": "SunshineLife AI Videos",
      },
    });
  }
  return client;
}

export async function chatCompletion(
  messages: ChatMessage[],
  modelOverride?: string
): Promise<{ text: string; model: string }> {
  const { model } = getLlmConfig();
  const useModel = (modelOverride || model).trim();
  const completion = await getClient().chat.completions.create({
    model: useModel,
    messages,
    temperature: 0.4,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("模型返回为空");
  }
  return { text, model: useModel };
}
