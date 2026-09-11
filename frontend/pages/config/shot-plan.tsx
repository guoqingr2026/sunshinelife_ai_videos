import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ShotPlanConfig, ShotPlanPreview } from "../../utils/api";

type ManimTypeSpec = {
  id: string;
  label: string;
  category: string;
  desc: string;
  keywords: string[];
};

export default function ShotPlanPage() {
  const [article, setArticle] = useState("");
  const [preview, setPreview] = useState<ShotPlanPreview | null>(null);
  const [saved, setSaved] = useState<ShotPlanConfig | null>(null);
  const [types, setTypes] = useState<ManimTypeSpec[]>([]);
  const [gptPrompt, setGptPrompt] = useState("");
  const [defaultArticle, setDefaultArticle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    Promise.all([api.getShotPlan(), api.getShotPlanSpec()])
      .then(([plan, spec]) => {
        setArticle(plan.article);
        setSaved(plan);
        setTypes(spec.types);
        setGptPrompt(spec.gptPrompt);
        setDefaultArticle(spec.defaultArticle);
      })
      .finally(() => setLoading(false));
  }, []);

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const handlePreview = async () => {
    const result = await api.previewShotPlan(article);
    setPreview(result);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const config = await api.saveShotPlan(article);
      setSaved(config);
      setPreview({ rules: config.rules, shots: config.shots, errors: [] });
      setMessage("已保存！一键成片将自动使用这些规则。");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!defaultArticle) return;
    if (!confirm("恢复为完整默认模板？当前编辑内容将被替换。")) return;
    setArticle(defaultArticle);
    setMessage("已加载默认模板，请编辑后点保存。");
  };

  if (loading) {
    return <p className="text-gray-500">加载中…</p>;
  }

  const categories = ["工程", "数学", "信息图", "文本", "结构"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">镜头规划文章</h1>
      <p className="text-gray-400 text-sm mb-4">
        复制下方 <strong className="text-white">GPT 提示词</strong> 到 ChatGPT，让它按规格输出分镜 JSON；
        贴回本页保存后，
        <Link to="/config/auto-video" className="text-primary underline mx-1">
          一键成片
        </Link>
        自动读取。
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => copyText(gptPrompt, "gpt")}
          className="px-4 py-2 bg-primary rounded-lg text-sm font-medium hover:bg-red-600"
        >
          {copied === "gpt" ? "已复制！" : "复制 GPT 分镜提示词"}
        </button>
        <button
          onClick={() => copyText(defaultArticle, "article")}
          className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:border-gray-400"
        >
          {copied === "article" ? "已复制！" : "复制完整规格文章"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:border-gray-400"
        >
          恢复默认模板
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm text-gray-400">规划文章（粘贴 GPT 输出或手动编辑）</label>
          <textarea
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            rows={28}
            className="w-full bg-darker border border-gray-600 rounded-lg p-3 text-sm font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePreview}
              className="px-4 py-2 border border-gray-600 rounded-lg hover:border-gray-400 text-sm"
            >
              预览解析
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存并生效"}
            </button>
          </div>
          {message && <p className="text-green-400 text-sm">{message}</p>}
          {saved?.updatedAt && (
            <p className="text-xs text-gray-500">
              上次保存: {new Date(saved.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="bg-darker border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">格式规范（GPT 必须遵守）</h3>
            <div className="text-xs text-gray-400 space-y-3">
              <div>
                <p className="text-gray-300 font-medium mb-1">1. 关键词规则（每行一条）</p>
                <pre className="bg-black/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">
{`关键词1, 关键词2 → manim类型ID | 显示标签

pn结, pn → pn_junction | PN 结
遗忘, 记忆曲线 → forgetting_curve | 遗忘曲线`}
                </pre>
              </div>
              <div>
                <p className="text-gray-300 font-medium mb-1">2. 固定镜头序列（可选，按顺序用）</p>
                <pre className="bg-black/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">
{`## 镜头序列
1. pn_junction | PN 结原理
2. forgetting_curve | 遗忘曲线
3. typewriter_text | 学习技巧`}
                </pre>
              </div>
              <div>
                <p className="text-gray-300 font-medium mb-1">3. JSON 整段（推荐，三种粘贴方式均可）</p>
                <pre className="bg-black/40 p-2 rounded overflow-x-auto whitespace-pre-wrap text-[11px]">
{`方式A: \`\`\`json { "rules":[], "shots":[] } \`\`\`
方式B: 直接粘贴 { "rules":[], "shots":[] }
方式C: GPT 输出 "json" 换行后接 { ... }`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-darker border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">
              全部 Manim 类型与关键词（{types.length} 种）
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="text-xs text-primary font-medium mb-1">{cat}</p>
                  <div className="space-y-1">
                    {types
                      .filter((t) => t.category === cat)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="text-xs bg-black/30 rounded p-2 font-mono"
                        >
                          <span className="text-yellow-300">{t.id}</span>
                          <span className="text-gray-500 mx-1">|</span>
                          <span className="text-white">{t.label}</span>
                          <p className="text-gray-500 mt-0.5">{t.desc}</p>
                          <p className="text-gray-400 mt-0.5">
                            {t.keywords.join(", ")} → {t.id} | {t.label}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {preview && (
            <div className="bg-darker border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm">解析结果</h3>
              {preview.errors.length > 0 && (
                <ul className="text-yellow-400 text-xs mb-2">
                  {preview.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-gray-400 mb-2">
                规则 {preview.rules.length} 条 · 固定镜头 {preview.shots.length} 个
                {preview.shots.length > 0 && "（按顺序使用，忽略关键词匹配）"}
              </p>
              <pre className="text-xs text-gray-300 overflow-auto max-h-48 whitespace-pre-wrap">
                {JSON.stringify({ rules: preview.rules, shots: preview.shots }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
