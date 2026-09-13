const HANDOFF_KEY = "learnv:compose-project-json";
const HANDOFF_AT_KEY = "learnv:compose-project-json:at";

export function setProjectHandoff(projectJson: string): void {
  localStorage.setItem(HANDOFF_KEY, projectJson);
  localStorage.setItem(HANDOFF_AT_KEY, new Date().toISOString());
}

/** 读取并清除 handoff，用于一键成片页首次加载 */
export function consumeProjectHandoff(): string | null {
  const value = localStorage.getItem(HANDOFF_KEY);
  if (!value) return null;
  localStorage.removeItem(HANDOFF_KEY);
  localStorage.removeItem(HANDOFF_AT_KEY);
  return value;
}

export function peekProjectHandoffAt(): string | null {
  return localStorage.getItem(HANDOFF_AT_KEY);
}
