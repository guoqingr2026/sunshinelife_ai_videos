import type { ManimSceneExample } from "../components/ManimExampleGallery";

const STORAGE_KEY = "manim-user-scene-examples-v1";

export interface UserSceneExample {
  id: string;
  label: string;
  type: string;
  category: string;
  desc?: string;
  needsOpengl?: boolean;
  params: Record<string, unknown>;
  createdAt: string;
}

export function loadUserSceneExamples(): UserSceneExample[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as UserSceneExample[]) : [];
  } catch {
    return [];
  }
}

export function persistUserSceneExamples(list: UserSceneExample[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addUserSceneExample(entry: Omit<UserSceneExample, "id" | "createdAt">): UserSceneExample {
  const item: UserSceneExample = {
    ...entry,
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const list = loadUserSceneExamples();
  list.unshift(item);
  persistUserSceneExamples(list);
  return item;
}

export function removeUserSceneExample(id: string): void {
  persistUserSceneExamples(loadUserSceneExamples().filter((e) => e.id !== id));
}

export function userExampleToSceneExample(u: UserSceneExample): ManimSceneExample {
  return {
    id: u.id,
    label: u.label,
    category: u.category,
    type: u.type,
    needsOpengl: u.needsOpengl,
    desc: u.desc || "我的自定义示例",
    params: u.params,
  };
}

export function exportUserExamplesJson(): string {
  return JSON.stringify(loadUserSceneExamples(), null, 2);
}

export function importUserExamplesJson(raw: string): number {
  const data = JSON.parse(raw) as UserSceneExample[];
  if (!Array.isArray(data)) throw new Error("需要 JSON 数组");
  const valid = data.filter((e) => e?.type && e?.label && e?.params);
  persistUserSceneExamples(valid);
  return valid.length;
}
