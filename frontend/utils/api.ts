const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export interface Subtitle {
  id: string;
  rawText: string;
  type: string;
  createdAt: string;
}

export interface Task {
  id: string;
  kind: "manim" | "remotion" | "hyperframes";
  status: "pending" | "running" | "success" | "failed";
  payload: Record<string, unknown>;
  outputUrl?: string;
  framesUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemotionTemplate {
  id: string;
  name: string;
  templateId: string;
  timeline: unknown[];
  theme: Record<string, unknown>;
  createdAt: string;
}

export interface ManimStatus {
  manimInstalled: boolean;
  pythonInstalled: boolean;
  ffmpegInstalled: boolean;
  mode: "real" | "placeholder";
  hint: string;
  recentTasks: Array<{
    id: string;
    status: string;
    outputUrl?: string;
    type: string;
    createdAt: string;
  }>;
}

export const api = {
  createSubtitle: (data: { rawText?: string; content?: string; type?: string }) =>
    request<Subtitle>("/api/subtitle", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSubtitles: () => request<Subtitle[]>("/api/subtitle"),

  getSubtitle: (id: string) => request<Subtitle>(`/api/subtitle/${id}`),

  getManimStatus: () => request<ManimStatus>("/api/manim/status"),

  createManimTask: (data: {
    type: string;
    params?: Record<string, unknown>;
    subtitleId?: string;
  }) =>
    request<{ taskId: string; status: string }>("/api/manim/task", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getManimTask: (id: string) => request<Task>(`/api/manim/task/${id}`),

  createRemotionTask: (data: {
    templateId: string;
    timeline: Array<Record<string, unknown>>;
    theme?: Record<string, unknown>;
    preview?: boolean;
  }) =>
    request<{ taskId: string; status: string }>("/api/remotion/task", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRemotionTask: (id: string) => request<Task>(`/api/remotion/task/${id}`),

  getRemotionTemplates: () => request<RemotionTemplate[]>("/api/remotion/templates"),

  saveRemotionTemplate: (data: {
    name: string;
    templateId: string;
    timeline: unknown[];
    theme: Record<string, unknown>;
  }) =>
    request<RemotionTemplate>("/api/remotion/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteRemotionTemplate: (id: string) =>
    request<{ success: boolean }>(`/api/remotion/templates/${id}`, {
      method: "DELETE",
    }),

  createHyperFramesTask: (data: {
    prompt: string;
    duration: number;
    fps: number;
    style: string;
  }) =>
    request<{ taskId: string; status: string }>("/api/hyperframes/task", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHyperFramesTask: (id: string) => request<Task>(`/api/hyperframes/task/${id}`),

  getTasks: (kind?: string) =>
    request<Task[]>(`/api/tasks${kind ? `?kind=${kind}` : ""}`),

  getTask: (id: string) => request<Task>(`/api/tasks/${id}`),

  deleteTask: (id: string) =>
    request<{ success: boolean }>(`/api/tasks/${id}`, { method: "DELETE" }),
};
