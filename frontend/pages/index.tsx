import { Link } from "react-router-dom";

const modules = [
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
      <h1 className="text-3xl font-bold mb-2">低成本网页端动画生产系统</h1>
      <p className="text-gray-400 mb-8">
        Remotion + Manim + HyperFrames + AI 文案生成
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            to={m.href}
            className="block p-6 bg-darker rounded-lg border border-gray-700 hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold text-primary mb-2">
              {m.title}
            </h2>
            <p className="text-gray-400 text-sm">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
