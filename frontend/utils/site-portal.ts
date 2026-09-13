/**
 * 同域站点门户 — 与 ECS 上 english / 动画 / 根站互链（参考 SMPS 知识库多站点导航）
 */
function origin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_ECS_ORIGIN || "http://47.99.184.249";
}

function basePath(): string {
  const raw = import.meta.env.VITE_BASE_PATH || "/sunshinelife_ai_videos/";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export interface PortalSite {
  id: string;
  label: string;
  desc: string;
  href: string;
  external?: boolean;
}

export function getPortalSites(): PortalSite[] {
  const o = origin();
  return [
    {
      id: "root",
      label: "ECS 根站",
      desc: "服务器首页 / 知识库入口",
      href: import.meta.env.VITE_ECS_ROOT_URL || `${o}/`,
      external: true,
    },
    {
      id: "english",
      label: "英语学习",
      desc: "Pep6 English / 词汇与课程",
      href: import.meta.env.VITE_ENGLISH_URL || `${o}/english/`,
      external: true,
    },
    {
      id: "videos",
      label: "动画生产（本系统）",
      desc: "Manim + Remotion 一键成片",
      href: import.meta.env.VITE_VIDEOS_URL || `${o}${basePath()}/`,
      external: false,
    },
    {
      id: "manim-docs",
      label: "Manim 官方示例",
      desc: "docs.manim.community",
      href: "https://docs.manim.community/en/stable/examples.html",
      external: true,
    },
  ];
}
