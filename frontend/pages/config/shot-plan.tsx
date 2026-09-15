import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ShotPlanConfig, ShotPlanPreview } from "../../utils/api";
import { setProjectHandoff } from "../../utils/project-bridge";
import {
  COMPOSITE_PIP_SHOT,
  COMPOSITE_PRESET_HELP,
  COMPOSITE_SPLIT_SHOT,
} from "../../utils/composite-shot-presets";

type ManimTypeSpec = {
  id: string;
  label: string;
  category: string;
  desc: string;
  keywords: string[];
};

export default function ShotPlanPage() {
  const navigate = useNavigate();
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
      .catch((err: Error) => {
        setMessage(`加载失败: ${err.message}。请确认已执行 backend build 并 pm2 restart。`);
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
      setPreview({
        rules: config.rules,
        shots: config.shots,
        title: config.title,
        theme: config.theme,
        errors: [],
      });
      setMessage(`已保存 ${config.shots.length} 个固定镜头。可点「发送到一键成片」导入项目 JSON。`);
    } finally {
      setSaving(false);
    }
  };

  const handleSendToCompose = async () => {
    setMessage("");
    try {
      const project = await api.getShotPlanProject();
      setProjectHandoff(project.projectJson);
      navigate("/config/auto-video");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "导出失败：请先保存含 shots 的规划");
    }
  };

  const handleExportJson = async () => {
    try {
      const project = await api.getShotPlanProject();
      await navigator.clipboard.writeText(project.projectJson);
      setCopied("project");
      setTimeout(() => setCopied(""), 2000);
      setMessage(`已复制项目 JSON（${project.shotCount} 个镜头）`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "请先保存含 shots 的规划");
    }
  };

  const handleReset = () => {
    if (!defaultArticle) return;
    if (!confirm("恢复为完整默认模板？当前编辑内容将被替换。")) return;
    setArticle(defaultArticle);
    setMessage("已加载默认模板，请编辑后点保存。");
  };

  if (loading) {
    return <p className="text-muted">加载中…</p>;
  }

  const categories = ["工程", "数学", "信息图", "文本", "结构"];

  return (
    <div>
      <h1 className="page-title">镜头规划（步骤 1）</h1>
      <p className="page-desc">
        复制 <strong className="text-ink">GPT 分镜提示词</strong> → 生成 JSON → 贴回本页保存 →
        <strong className="text-ink">发送到一键成片</strong>（步骤 2）。
        也可在
        <Link to="/config/prompts" className="text-primary underline mx-1">提示词库</Link>
        查看全流程模板。
      </p>

      <div className="panel-muted mb-6 text-xs text-muted flex flex-wrap gap-4">
        <span><strong className="text-primary">① 镜头规划</strong> 生成分镜 JSON</span>
        <span>→</span>
        <span><strong className="text-ink">② 一键成片</strong> Manim + Remotion</span>
        <span>→</span>
        <span>③ 任务管理下载</span>
      </div>

      <div className="panel-muted mb-4 text-xs text-muted space-y-2">
        <p className="text-ink font-semibold">合成布局预设（追加到 JSON shots[]）</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              copyText(
                JSON.stringify({ aspect: "9:16", shot: COMPOSITE_SPLIT_SHOT }, null, 2),
                "split"
              )
            }
            className="pill-tab text-xs py-1"
          >
            {copied === "split" ? "已复制竖屏分屏镜头" : "复制竖屏分屏镜头 JSON"}
          </button>
          <button
            type="button"
            onClick={() =>
              copyText(
                JSON.stringify({ aspect: "16:9", shot: COMPOSITE_PIP_SHOT }, null, 2),
                "pip"
              )
            }
            className="pill-tab text-xs py-1"
          >
            {copied === "pip" ? "已复制画中画镜头" : "复制横屏画中画 JSON"}
          </button>
        </div>
        <pre className="code-block whitespace-pre-wrap text-[10px]">{COMPOSITE_PRESET_HELP}</pre>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => copyText(gptPrompt, "gpt")} className="btn-primary text-sm py-2">
          {copied === "gpt" ? "已复制！" : "复制 GPT 分镜提示词"}
        </button>
        <button onClick={() => copyText(defaultArticle, "article")} className="btn-secondary text-sm py-2">
          {copied === "article" ? "已复制！" : "复制完整规格文章"}
        </button>
        <button onClick={handleReset} className="btn-outline">
          恢复默认模板
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm text-muted font-semibold">规划文章（粘贴 GPT 输出或手动编辑）</label>
          <textarea
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            rows={28}
            className="input-field p-3 text-sm font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={handlePreview} className="btn-outline">
              预览解析
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "保存中…" : "保存并生效"}
            </button>
            <button type="button" onClick={handleExportJson} className="btn-outline">
              {copied === "project" ? "已复制 JSON" : "导出项目 JSON"}
            </button>
            <button type="button" onClick={handleSendToCompose} className="btn-primary">
              发送到一键成片 →
            </button>
          </div>
          {message && <p className="text-success text-sm font-semibold">{message}</p>}
          {saved?.updatedAt && (
            <p className="text-xs text-muted">
              上次保存: {new Date(saved.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="panel">
            <h3 className="font-bold mb-2 text-sm text-ink">格式规范（GPT 必须遵守）</h3>
            <div className="text-xs text-muted space-y-3">
              <div>
                <p className="text-ink font-semibold mb-1">1. 关键词规则（每行一条）</p>
                <pre className="code-block whitespace-pre-wrap">
{`关键词1, 关键词2 → manim类型ID | 显示标签

pn结, pn → pn_junction | PN 结
遗忘, 记忆曲线 → forgetting_curve | 遗忘曲线`}
                </pre>
              </div>
              <div>
                <p className="text-ink font-semibold mb-1">2. 固定镜头序列（可选，按顺序用）</p>
                <pre className="code-block whitespace-pre-wrap">
{`## 镜头序列
1. pn_junction | PN 结原理
2. forgetting_curve | 遗忘曲线
3. typewriter_text | 学习技巧`}
                </pre>
              </div>
              <div>
                <p className="text-ink font-semibold mb-1">3. JSON 整段（推荐，三种粘贴方式均可）</p>
                <pre className="code-block whitespace-pre-wrap text-[11px]">
                  方式A: 用 markdown 代码块包裹 JSON{"\n"}
                  方式B: 直接粘贴纯 JSON 对象{"\n"}
                  方式C: GPT 输出 json 换行后接对象
                </pre>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 className="font-bold mb-2 text-sm text-ink">
              全部 Manim 类型与关键词（{types.length} 种）
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="text-xs text-primary font-bold mb-1">{cat}</p>
                  <div className="space-y-1">
                    {types
                      .filter((t) => t.category === cat)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="text-xs bg-surface border border-border rounded-lg p-2 font-mono"
                        >
                          <span className="text-amber-700 font-bold">{t.id}</span>
                          <span className="text-muted mx-1">|</span>
                          <span className="text-ink font-semibold">{t.label}</span>
                          <p className="text-muted mt-0.5">{t.desc}</p>
                          <p className="text-muted mt-0.5">
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
            <div className="panel">
              <h3 className="font-bold mb-2 text-sm text-ink">解析结果</h3>
              {preview.title && (
                <p className="text-xs text-ink mb-1">
                  标题: <strong>{preview.title}</strong>
                  {preview.theme?.name && (
                    <span className="text-muted ml-2">主题: {preview.theme.name}</span>
                  )}
                </p>
              )}
              {preview.errors.length > 0 && (
                <ul className="text-amber-700 text-xs mb-2 font-semibold">
                  {preview.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted mb-2">
                规则 {preview.rules.length} 条 · 固定镜头 {preview.shots.length} 个
                {preview.shots.length > 0 && "（按顺序使用，忽略关键词匹配）"}
              </p>
              <p className="text-xs text-muted mb-2">
                typewriter_text 应含 text / highlight；导出时会保留完整内容。
              </p>
              <pre className="text-xs text-ink code-block max-h-48 whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    title: preview.title,
                    theme: preview.theme,
                    rules: preview.rules,
                    shots: preview.shots,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
