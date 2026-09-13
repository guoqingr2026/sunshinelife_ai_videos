import { Link } from "react-router-dom";

const modules = [
  {
    href: "/config/shot-plan",
    title: "镜头规划（步骤 1）",
    desc: "GPT 分镜 JSON → 保存 → 发送到一键成片",
  },
  {
    href: "/config/auto-video",
    title: "一键成片（步骤 2）",
    desc: "导入项目 JSON → Manim + Remotion 自动合成",
  },
  {
    href: "/editor/subtitle",
    title: "字幕编辑",
    desc: "上传 SRT/TXT，自动断句修复",
  },
  {
    href: "/config/manim",
    title: "Manim 动画",
    desc: "PN结、能带结构等工程动画",
  },
  {
    href: "/config/hyperframes",
    title: "HyperFrames",
    desc: "AI 手绘帧动画生成",
  },
  {
    href: "/config/remotion",
    title: "Remotion 合成",
    desc: "标题、参数展示、时间轴合成",
  },
  {
    href: "/packaging/bilibili",
    title: "B站文案",
    desc: "复制提示词，在 ChatGPT 中生成文案",
  },
  { href: "/tasks", title: "任务管理", desc: "查看渲染状态、下载视频" },
  {
    href: "/config/prompts",
    title: "提示词库",
    desc: "全流程模板提示词，手动复制 → 未来 API",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink mb-2">低成本网页端动画生产系统</h1>
      <p className="text-muted mb-8 text-lg">
        Remotion + Manim + HyperFrames + AI 文案生成
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link key={m.href} to={m.href} className="module-card">
            <h2 className="text-lg font-bold text-primary mb-2">{m.title}</h2>
            <p className="text-muted text-sm">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
