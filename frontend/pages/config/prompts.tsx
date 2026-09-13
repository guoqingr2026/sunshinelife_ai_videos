import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import { buildPackagingPrompt } from "../../utils/packaging-prompt";
import {
  WORKFLOW_STEPS,
  buildComposeProjectPromptExample,
  buildHyperFramesPrompt,
  buildManimDebugPrompt,
  buildSubtitleCleanupPrompt,
} from "../../utils/workflow-prompts";

type StepResponses = Record<string, string>;

export default function PromptsPage() {
  const [gptShotPlanPrompt, setGptShotPlanPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [responses, setResponses] = useState<StepResponses>({});
  const [hfScene, setHfScene] = useState("手绘风格的光耦内部结构，LED 发光，箭头表示光子流动");
  const [hfStyle, setHfStyle] = useState<"handdrawn" | "ui" | "engineering">("handdrawn");
  const [manimType, setManimType] = useState("pn_junction");
  const [subtitleSample, setSubtitleSample] = useState("大家好今天我们来讲一下PN结的工作原理");
  const [biliStyle, setBiliStyle] = useState("engineering");

  useEffect(() => {
    api
      .getShotPlanSpec()
      .then((spec) => setGptShotPlanPrompt(spec.gptPrompt))
      .catch(() => setGptShotPlanPrompt("（加载失败，请确认后端已启动）"))
      .finally(() => setLoading(false));
  }, []);

  const promptByStep = useMemo(() => {
    const map: Record<string, string> = {
      "shot-plan": gptShotPlanPrompt,
      compose: buildComposeProjectPromptExample(),
      subtitle: buildSubtitleCleanupPrompt(subtitleSample),
      manim: buildManimDebugPrompt(manimType),
      hyperframes: buildHyperFramesPrompt(hfScene, hfStyle),
      remotion: `请为 Remotion 时间轴生成 JSON 数组。每段含 type、durationInFrames、props。
可用 type：title, chapter, bullet_list, fade_text, subtitle, quote, flow_steps, timeline_bar, formula_card, compare, arrow, stat, manim_clip。
示例：
\`\`\`json
[
  { "type": "title", "durationInFrames": 90, "props": { "title": "视频标题", "subtitle": "副标题" } },
  { "type": "bullet_list", "durationInFrames": 120, "props": { "title": "要点", "items": ["一", "二"] } }
]
\`\`\``,
      bilibili: buildPackagingPrompt(subtitleSample, biliStyle),
      tasks: `（本步骤无 AI 提示词）在任务管理页查看各任务 status / error / outputUrl。
常见失败：
- compose：Manim 未安装 → 占位视频；Remotion 失败看日志
- hyperframes：无 IMAGE_API_KEY → 占位图；无 ffmpeg → 无 MP4
- manim：type 不存在或 params 无效`,
    };
    return map;
  }, [gptShotPlanPrompt, hfScene, hfStyle, manimType, subtitleSample, biliStyle]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return <p className="text-muted">加载提示词…</p>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="page-title">模板提示词合集</h1>
        <p className="page-desc">
          按生产流水线顺序整理每一步的 AI 提示词。
          <strong className="text-ink"> 当前阶段：手动复制 → 粘贴 AI 回复</strong>；
          后续再接入 API 自动调用。
        </p>
      </div>

      <div className="panel-muted text-sm space-y-2">
        <p className="font-bold text-ink">推荐工作流</p>
        <ol className="list-decimal list-inside text-muted space-y-1">
          <li>
            <Link to="/config/shot-plan" className="text-primary underline">镜头规划</Link>
            {" "}→ 生成并保存分镜 JSON
          </li>
          <li>
            <Link to="/config/auto-video" className="text-primary underline">一键成片</Link>
            {" "}→ 导入 JSON 并渲染
          </li>
          <li>字幕 / Manim 单测 / HyperFrames / Remotion 按需使用</li>
          <li>
            <Link to="/packaging/bilibili" className="text-primary underline">B 站文案</Link>
            {" "}→ 发布前包装
          </li>
          <li>
            <Link to="/tasks" className="text-primary underline">任务管理</Link>
            {" "}→ 下载与排错
          </li>
        </ol>
      </div>

      {WORKFLOW_STEPS.map((step) => {
        const prompt = promptByStep[step.id] || "";
        const hasPrompt = step.id !== "tasks" && prompt.trim().length > 0;

        return (
          <section key={step.id} className="panel space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs text-primary font-bold mb-1">步骤 {step.order}</p>
                <h2 className="text-lg font-bold text-ink">{step.title}</h2>
                <p className="text-sm text-muted mt-1">{step.purpose}</p>
              </div>
              <Link to={step.route} className="btn-outline text-sm py-1.5">
                打开页面
              </Link>
            </div>

            <div className="text-xs text-muted">
              <p className="font-semibold text-ink mb-1">手动操作</p>
              <ul className="list-disc list-inside space-y-0.5">
                {step.manualSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="mt-2 text-primary/80">{step.automationNote}</p>
            </div>

            {step.id === "hyperframes" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-muted font-semibold text-xs">场景描述</label>
                  <input
                    value={hfScene}
                    onChange={(e) => setHfScene(e.target.value)}
                    className="input-field p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-muted font-semibold text-xs">风格</label>
                  <select
                    value={hfStyle}
                    onChange={(e) => setHfStyle(e.target.value as typeof hfStyle)}
                    className="input-field p-2 mt-1"
                  >
                    <option value="handdrawn">手绘</option>
                    <option value="ui">UI</option>
                    <option value="engineering">工程</option>
                  </select>
                </div>
              </div>
            )}

            {step.id === "manim" && (
              <div className="text-sm">
                <label className="text-muted font-semibold text-xs">Manim 类型 ID</label>
                <input
                  value={manimType}
                  onChange={(e) => setManimType(e.target.value)}
                  className="input-field p-2 mt-1 max-w-xs font-mono"
                />
              </div>
            )}

            {(step.id === "subtitle" || step.id === "bilibili") && (
              <div className="text-sm space-y-2">
                <div>
                  <label className="text-muted font-semibold text-xs">示例字幕 / 讲稿</label>
                  <textarea
                    value={subtitleSample}
                    onChange={(e) => setSubtitleSample(e.target.value)}
                    rows={3}
                    className="input-field p-2 mt-1 text-sm"
                  />
                </div>
                {step.id === "bilibili" && (
                  <div>
                    <label className="text-muted font-semibold text-xs">包装风格</label>
                    <select
                      value={biliStyle}
                      onChange={(e) => setBiliStyle(e.target.value)}
                      className="input-field p-2 mt-1 max-w-xs"
                    >
                      <option value="engineering">工程科普</option>
                      <option value="casual">轻松有趣</option>
                      <option value="academic">学术严谨</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {hasPrompt && (
              <>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copy(prompt, step.id)}
                    className="btn-primary text-sm py-2"
                  >
                    {copied === step.id ? "已复制！" : "复制提示词"}
                  </button>
                </div>
                <pre className="code-block text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {prompt}
                </pre>
              </>
            )}

            {step.id !== "tasks" && (
              <div>
                <label className="block text-sm text-muted font-semibold mb-1">
                  AI 回复（本地记录，刷新后丢失）
                </label>
                <textarea
                  value={responses[step.id] || ""}
                  onChange={(e) =>
                    setResponses((prev) => ({ ...prev, [step.id]: e.target.value }))
                  }
                  rows={5}
                  placeholder="将 ChatGPT / Claude 的回复粘贴到这里，便于对照下一步…"
                  className="input-field p-3 text-sm font-mono"
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
