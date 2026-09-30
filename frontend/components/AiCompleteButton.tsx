import { useState } from "react";
import { api } from "../utils/api";

type Props = {
  label?: string;
  system?: string;
  user: string;
  disabled?: boolean;
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  className?: string;
};

export default function AiCompleteButton({
  label = "用 OpenRouter 模型生成",
  system,
  user,
  disabled,
  onResult,
  onError,
  className = "btn-outline text-sm py-1.5",
}: Props) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!user.trim()) {
      onError?.("请先填写提示词或输入内容");
      return;
    }
    setLoading(true);
    try {
      const { text } = await api.llmComplete({ system, user });
      onResult(text);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" className={className} disabled={disabled || loading} onClick={run}>
      {loading ? "生成中…" : label}
    </button>
  );
}
