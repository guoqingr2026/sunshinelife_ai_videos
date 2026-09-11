import { useState } from "react";
import { api, Subtitle } from "../../utils/api";

export default function SubtitleEditor() {
  const [text, setText] = useState("");
  const [type, setType] = useState("txt");
  const [saved, setSaved] = useState<Subtitle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    setType(ext === "srt" ? "srt" : "txt");
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.createSubtitle({ content: text, type });
      setSaved(result);
      setText(result.rawText);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">字幕编辑</h1>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          上传字幕文件 (.srt / .txt)
        </label>
        <input
          type="file"
          accept=".srt,.txt"
          onChange={handleFileUpload}
          className="text-sm text-gray-300"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">字幕内容</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className="w-full bg-darker border border-gray-600 rounded-lg p-4 text-sm font-mono focus:border-primary focus:outline-none"
          placeholder="粘贴或上传字幕内容..."
        />
      </div>

      <div className="flex gap-3 items-center">
        <button
          onClick={handleSave}
          disabled={loading || !text.trim()}
          className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "保存中..." : "保存（自动断句修复）"}
        </button>
        {saved && (
          <span className="text-green-400 text-sm">
            已保存 ID: {saved.id}
          </span>
        )}
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>
    </div>
  );
}
