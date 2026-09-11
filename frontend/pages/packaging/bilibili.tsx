import { useEffect, useState } from "react";
import { api, Subtitle } from "../../utils/api";
import { buildPackagingPrompt } from "../../utils/packaging-prompt";

export default function BilibiliPackagingPage() {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [subtitleId, setSubtitleId] = useState("");
  const [style, setStyle] = useState("engineering");
  const [customText, setCustomText] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState<"prompt" | "result" | null>(null);

  useEffect(() => {
    api.getSubtitles().then(setSubtitles).catch(() => {});
  }, []);

  const selectedSubtitle = subtitles.find((s) => s.id === subtitleId);
  const subtitleText = selectedSubtitle?.rawText || customText;
  const prompt = subtitleText ? buildPackagingPrompt(subtitleText, style) : "";

  const copy = async (text: string, kind: "prompt" | "result") => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">B 站包装文案</h1>
      <p className="text-gray-400 text-sm mb-6">
        复制提示词 → 粘贴到 ChatGPT / Claude 等 → 把回复贴回来即可。无需配置 API Key。
      </p>

      <div className="space-y-4">
        {subtitles.length > 0 ? (
          <div>
            <label className="block text-sm text-gray-400 mb-2">从已保存字幕选择</label>
            <select
              value={subtitleId}
              onChange={(e) => {
                setSubtitleId(e.target.value);
                if (e.target.value) setCustomText("");
              }}
              className="w-full bg-darker border border-gray-600 rounded-lg p-2"
            >
              <option value="">-- 或手动输入下方 --</option>
              {subtitles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rawText.slice(0, 50).replace(/\n/g, " ")}…
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {!subtitleId && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">字幕 / 视频讲稿</label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={6}
              placeholder="粘贴字幕或讲稿原文…"
              className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-2">风格</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full max-w-xs bg-darker border border-gray-600 rounded-lg p-2"
          >
            <option value="engineering">工程科普</option>
            <option value="casual">轻松有趣</option>
            <option value="academic">学术严谨</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => copy(prompt, "prompt")}
            disabled={!prompt}
            className="px-5 py-2 bg-primary rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {copied === "prompt" ? "已复制" : "复制提示词"}
          </button>
        </div>

        {prompt && (
          <details className="bg-darker border border-gray-700 rounded-lg">
            <summary className="px-4 py-2 text-sm text-gray-400 cursor-pointer">
              预览提示词
            </summary>
            <pre className="px-4 pb-4 text-xs text-gray-300 whitespace-pre-wrap font-sans">
              {prompt}
            </pre>
          </details>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">粘贴 AI 回复</label>
            <button
              onClick={() => copy(result, "result")}
              disabled={!result.trim()}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {copied === "result" ? "已复制" : "复制文案"}
            </button>
          </div>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={14}
            placeholder="把 ChatGPT / Claude 等模型的完整回复粘贴到这里…"
            className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
