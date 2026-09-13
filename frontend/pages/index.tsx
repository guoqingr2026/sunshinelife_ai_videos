import { Link } from "react-router-dom";

const modules = [
  {
    href: "/config/auto-video",
    title: "一键自动成片",
    desc: "填写要求 → 自动 Manim + 时间轴 + 合成",
  },
  {
    href: "/config/shot-plan",
    title: "镜头规划文章",
    desc: "粘贴 GPT 分镜 → 自动解析生效",
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
