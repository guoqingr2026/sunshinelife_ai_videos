import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { href: "/editor/subtitle", label: "字幕编辑" },
  { href: "/config/manim", label: "Manim" },
  { href: "/config/hyperframes", label: "HyperFrames" },
  { href: "/config/remotion", label: "Remotion" },
  { href: "/packaging/bilibili", label: "B站文案" },
  { href: "/tasks", label: "任务管理" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            动画生产系统
          </Link>
          <nav className="flex gap-1 flex-wrap">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  location.pathname === item.href
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
