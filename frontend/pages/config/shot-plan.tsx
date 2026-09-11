import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ShotPlanConfig, ShotPlanPreview } from "../../utils/api";

export default function ShotPlanPage() {
  const [article, setArticle] = useState("");
  const [preview, setPreview] = useState<ShotPlanPreview | null>(null);
  const [saved, setSaved] = useState<ShotPlanConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .getShotPlan()
      .then((data) => {
        setArticle(data.article);
        setSaved(data);
      })
      .finally(() => setLoading(false));
  }, []);

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
      setPreview({
        rules: config.rules,
        shots: config.shots,
        errors: [],
      });
      setMessage("已保存！一键成片将自动使用这些规则。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">加载中…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">镜头规划文章</h1>
      <p className="text-gray-400 text-sm mb-4">
        把 GPT 拆好的镜头贴到下面，点<strong className="text-white">保存</strong>即可。
        系统会解析并写入运行时配置（无需改代码、无需重新编译），
        <Link to="/config/auto-video" className="text-primary underline ml-1">
          一键成片
        </Link>
        会自动读取。
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm text-gray-400">规划文章（Markdown / 行格式 / JSON 块）</label>
          <textarea
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            rows={22}
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

        <div className="space-y-4">
          <div className="bg-darker border border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">格式说明</h3>
            <div className="text-xs text-gray-400 space-y-2">
              <p><strong className="text-gray-300">关键词规则</strong>（每行一条）：</p>
              <pre className="bg-black/40 p-2 rounded overflow-x-auto">
{`pn结, pn → pn_junction | PN 结
遗忘 → forgetting_curve | 遗忘曲线`}
              </pre>
              <p><strong className="text-gray-300">镜头序列</strong>（可选，按顺序强制使用）：</p>
              <pre className="bg-black/40 p-2 rounded overflow-x-auto">
{`## 镜头序列
1. pn_junction | PN 结原理
2. forgetting_curve | 遗忘曲线`}
              </pre>
              <p>也支持整段 <code>```json</code> 代码块，含 <code>rules</code> 和 <code>shots</code> 数组。</p>
              <p className="text-yellow-600/80">
                Manim 类型 ID 见 Manim 页下拉列表（如 pn_junction、forgetting_curve）。
              </p>
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
                {preview.shots.length > 0 && "（将按顺序使用，忽略关键词匹配）"}
              </p>
              <pre className="text-xs text-gray-300 overflow-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify({ rules: preview.rules, shots: preview.shots }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
