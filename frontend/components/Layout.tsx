import { Link, useLocation } from "react-router-dom";
import { getPortalSites } from "../utils/site-portal";

const NAV_ITEMS = [
  { href: "/config/shot-plan", label: "镜头规划" },
  { href: "/config/auto-video", label: "一键成片" },
  { href: "/editor/subtitle", label: "字幕编辑" },
  { href: "/config/manim", label: "Manim" },
  { href: "/config/hyperframes", label: "HyperFrames" },
  { href: "/config/remotion", label: "Remotion" },
  { href: "/packaging/bilibili", label: "B站文案" },
  { href: "/tasks", label: "任务管理" },
  { href: "/config/prompts", label: "提示词库" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const portals = getPortalSites();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card/95 backdrop-blur border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="text-xl font-extrabold text-primary shrink-0">
            动画生产系统
          </Link>
          <nav className="flex gap-2 flex-wrap">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={
                  location.pathname === item.href ? "nav-tab nav-tab-active" : "nav-tab"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
      <footer className="border-t border-border bg-card/80 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-3 text-sm">
          <span className="text-muted font-semibold shrink-0">站点导航：</span>
          {portals.map((p) =>
            p.external ? (
              <a
                key={p.id}
                href={p.href}
                className="text-primary hover:underline"
                title={p.desc}
              >
                {p.label}
              </a>
            ) : (
              <Link key={p.id} to="/" className="text-primary hover:underline" title={p.desc}>
                {p.label}
              </Link>
            )
          )}
        </div>
      </footer>
    </div>
  );
}
