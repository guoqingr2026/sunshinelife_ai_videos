import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ShotPlanPreview } from "../../utils/api";
import { setProjectHandoff } from "../../utils/project-bridge";

const MODEL_OPTIONS = [
  { id: "openrouter/free", label: "OpenRouter 免费池 (推荐)" },
  { id: "openrouter/auto", label: "OpenRouter Auto（智能路由，可能非免费）" },
  { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B (free)" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (free)" },
  { id: "qwen/qwen2.5-7b-instruct:free", label: "Qwen 2.5 7B (free)" },
];

export default function AiTopicPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);
  const [llmReady, setLlmReady] = useState<boolean | null>(null);
  const [llmHint, setLlmHint] = useState("");
  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState("");
  const [preview, setPreview] = useState<ShotPlanPreview | null>(null);
  const [usedModel, setUsedModel] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .getShotPlanLlmStatus()
      .then((s) => {
        setLlmReady(s.configured);
        setLlmHint(
          s.configured
            ? `模型默认：${s.model}${s.proxy ? ` · 代理 ${s.proxy}` : ""}`
            : "后端未配置 OPENROUTER_API_KEY，请在 ECS .env 设置后 pm2 restart。"
        );
      })
      .catch(() => {
        setLlmReady(false);
        setLlmHint("无法读取 LLM 状态，请确认后端已更新并重启。");
      });
  }, []);

  const handleGenerate = async (andSave: boolean) => {
    if (!topic.trim()) {
      setMessage("请先输入选题一句话");
      return;
    }
    setGenerating(true);
    setMessage("");
    try {
      const result = await api.generateShotPlanFromTopic({
        topic: topic.trim(),
        model,
        save: andSave,
      });
      setArticle(result.article);
      setPreview(result.preview);
      setUsedModel(result.model);
      if (result.preview.errors?.length) {
        setMessage(`已生成，但解析有警告：${result.preview.errors.join("；")}`);
      } else if (andSave && result.saved) {
        setMessage(`已保存 ${result.saved.shots.length} 个镜头，可发送到一键成片。`);
      } else {
        setMessage(`生成成功（${result.preview.shots?.length ?? 0} 镜），可预览后保存。`);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendToCompose = async () => {
    setMessage("");
    try {
      if (!preview?.shots?.length) {
        await api.saveShotPlan(article);
      } else if (article) {
        await api.saveShotPlan(article);
      }
      const project = await api.getShotPlanProject();
      setProjectHandoff(project.projectJson);
      navigate("/config/auto-video");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "请先生成并保存有效 JSON");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="page-title">AI 选题 · 自动分镜 JSON</h1>
        <p className="page-desc">
          在
          <Link to="/config/prompts" className="text-primary underline mx-1">提示词库</Link>
          模板基础上，由后端免费模型（OpenRouter）直接生成项目 JSON，无需手动复制 ChatGPT。
          生成后可保存并
          <Link to="/config/auto-video" className="text-primary underline mx-1">一键成片</Link>。
        </p>
      </div>

      <div className="panel-muted text-sm space-y-1">
        <p className={llmReady ? "text-green-700 font-semibold" : "text-amber-700 font-semibold"}>
          {llmReady === null ? "检测 LLM 配置…" : llmReady ? "LLM 已就绪" : "LLM 未配置"}
        </p>
        <p className="text-muted text-xs">{llmHint}</p>
      </div>

      <section className="panel space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">视频选题（一句话）</span>
          <textarea
            className="input mt-1 min-h-[88px]"
            placeholder="例：用 3 分钟讲清楚 PN 结与二极管单向导电"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>

        <label className="block max-w-md">
          <span className="text-sm font-semibold text-ink">免费模型</span>
          <select
            className="input mt-1"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            disabled={generating || llmReady === false}
            onClick={() => handleGenerate(false)}
          >
            {generating ? "生成中…" : "生成 JSON 预览"}
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={generating || llmReady === false}
            onClick={() => handleGenerate(true)}
          >
            生成并保存到镜头规划
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={!article && !preview?.shots?.length}
            onClick={handleSendToCompose}
          >
            保存并发送到一键成片
          </button>
          <Link to="/config/shot-plan" className="btn-outline">打开镜头规划</Link>
        </div>

        {usedModel && (
          <p className="text-xs text-muted">上次调用模型：{usedModel}</p>
        )}
        {message && <p className="text-sm text-ink">{message}</p>}
      </section>

      {preview && (
        <section className="panel space-y-2">
          <h2 className="font-bold text-ink">解析预览</h2>
          <p className="text-sm text-muted">
            标题：{preview.title || "—"} · 镜头数：{preview.shots?.length ?? 0}
            {preview.errors?.length ? ` · 警告：${preview.errors.join("；")}` : ""}
          </p>
          <ul className="text-xs text-muted max-h-40 overflow-y-auto list-disc list-inside">
            {preview.shots?.slice(0, 12).map((s, i) => (
              <li key={i}>{s.type} — {s.label}</li>
            ))}
            {(preview.shots?.length ?? 0) > 12 && <li>…</li>}
          </ul>
        </section>
      )}

      {article && (
        <section className="panel space-y-2">
          <h2 className="font-bold text-ink">生成的文章 / JSON</h2>
          <textarea
            className="input font-mono text-xs min-h-[280px]"
            value={article}
            onChange={(e) => setArticle(e.target.value)}
          />
        </section>
      )}
    </div>
  );
}
