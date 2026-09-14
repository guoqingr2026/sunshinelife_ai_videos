import { useCallback, useEffect, useRef, useState } from "react";
import { api, type MediaAsset } from "../utils/api";
import {
  isMediaManimType,
  mediaParamKeyForType,
  suggestManimTypeForKind,
} from "../utils/manim-media-params";

interface Props {
  currentType: string;
  onApplyAsset: (url: string, kind: MediaAsset["kind"], suggestedType?: string) => void;
}

function guessEnglishName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  const ascii = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  return ascii && /[a-z0-9]/.test(ascii) ? ascii : "";
}

export default function ManimAssetLibrary({ currentType, onApplyAsset }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [sceneIndex, setSceneIndex] = useState(1);
  const [englishName, setEnglishName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.listMediaAssets();
      setAssets(data.assets);
      setSceneIndex(data.nextSceneIndex);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!englishName.trim()) {
      const guessed = guessEnglishName(file.name);
      if (guessed) setEnglishName(guessed);
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("请先选择文件");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await api.uploadMediaAsset(file, {
        sceneIndex,
        englishName: englishName.trim() || undefined,
      });
      setAssets((prev) => [result.asset, ...prev.filter((a) => a.id !== result.asset.id)]);
      setSceneIndex(result.nextSceneIndex);
      setEnglishName("");
      if (fileRef.current) fileRef.current.value = "";

      const suggested = suggestManimTypeForKind(result.asset.kind);
      if (currentType === suggested || isMediaManimType(currentType)) {
        onApplyAsset(result.asset.url, result.asset.kind, suggested);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`删除素材 ${filename}？`)) return;
    try {
      const result = await api.deleteMediaAsset(filename);
      setAssets((prev) => prev.filter((a) => a.filename !== filename));
      setSceneIndex(result.nextSceneIndex);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const paramKey = mediaParamKeyForType(currentType);
  const previewName = englishName.trim()
    ? `scene${sceneIndex}_${guessEnglishName(englishName) || "asset"}`
    : `scene${sceneIndex}_…`;

  return (
    <div className="panel space-y-3">
      <button
        type="button"
        className="w-full flex justify-between items-center text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-bold text-ink text-sm">素材库（{assets.length}）— 上传 /files/uploads</span>
        <span className="text-xs text-muted">{open ? "收起" : "展开"}</span>
      </button>

      {open && (
        <>
          <p className="text-xs text-muted leading-relaxed">
            命名规则：<code className="text-primary">scene{"{序号}"}_{"{英文名}"}.ext</code>
            （如 <code className="text-primary">scene1_product_intro.mp4</code>）。
            上传后生成 <code className="text-primary">/files/uploads/…</code>，可填入{" "}
            <code className="text-primary">imagePath</code> / <code className="text-primary">videoPath</code> /{" "}
            <code className="text-primary">svgPath</code>。
            {paramKey && (
              <span className="text-ink"> 当前 type 对应字段：<code className="text-primary">{paramKey}</code></span>
            )}
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-xs space-y-1">
              <span className="text-muted font-semibold">场景序号</span>
              <input
                type="number"
                min={1}
                value={sceneIndex}
                onChange={(e) => setSceneIndex(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="input-field p-2 w-full"
              />
            </label>
            <label className="text-xs space-y-1 sm:col-span-2">
              <span className="text-muted font-semibold">英文命名（可选，自动规范化）</span>
              <input
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="product_intro"
                className="input-field p-2 w-full font-mono"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,video/mp4,video/quicktime,video/webm,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mov,.webm"
              onChange={handleFileChange}
              className="text-xs"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {uploading ? "上传中…" : "上传并保存"}
            </button>
            <span className="text-[10px] text-muted font-mono">预览名：{previewName}</span>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {assets.length > 0 && (
            <div className="overflow-auto max-h-64 border border-border rounded-lg">
              <table className="w-full text-xs text-left min-w-[520px]">
                <thead className="sticky top-0 bg-surface border-b border-border text-muted">
                  <tr>
                    <th className="p-2">预览</th>
                    <th className="p-2">文件名 / URL</th>
                    <th className="p-2">场景</th>
                    <th className="p-2 w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="border-b border-border/60 hover:bg-primary/5">
                      <td className="p-2 align-top w-16">
                        {a.kind === "video" ? (
                          <video src={a.url} className="w-14 h-10 object-cover rounded bg-black" muted />
                        ) : (
                          <img src={a.url} alt="" className="w-14 h-10 object-cover rounded bg-surface" />
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <div className="font-mono text-[10px] text-primary break-all">{a.filename}</div>
                        <div className="text-muted mt-0.5">{a.originalName}</div>
                        <div className="font-mono text-[10px] text-muted break-all mt-0.5">{a.url}</div>
                      </td>
                      <td className="p-2 align-top whitespace-nowrap">
                        scene{a.sceneIndex}
                        <div className="text-muted">{a.kind}</div>
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            className="text-primary underline text-left"
                            onClick={() =>
                              onApplyAsset(a.url, a.kind, suggestManimTypeForKind(a.kind))
                            }
                          >
                            填入参数
                          </button>
                          <button
                            type="button"
                            className="text-muted underline text-left"
                            onClick={() => navigator.clipboard.writeText(a.url)}
                          >
                            复制 URL
                          </button>
                          <button
                            type="button"
                            className="text-red-500 text-left"
                            onClick={() => handleDelete(a.filename)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
