import fs from "fs";
import path from "path";
import { getStorageRoot, toPublicUrl } from "./storage";

export type AssetKind = "image" | "video" | "svg";

export interface StoredAsset {
  id: string;
  filename: string;
  url: string;
  sceneIndex: number;
  englishName: string;
  originalName: string;
  mime: string;
  kind: AssetKind;
  size: number;
  uploadedAt: string;
}

interface AssetManifest {
  version: number;
  assets: StoredAsset[];
}

const MANIFEST_VERSION = 1;
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm"]);
const SVG_EXT = new Set([".svg"]);

const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);
const VIDEO_MIME = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const SVG_MIME = new Set(["image/svg+xml"]);

export function getUploadsDir(): string {
  return path.join(getStorageRoot(), "files", "uploads");
}

function getManifestPath(): string {
  return path.join(getUploadsDir(), "manifest.json");
}

function readManifest(): AssetManifest {
  const manifestPath = getManifestPath();
  if (!fs.existsSync(manifestPath)) {
    return { version: MANIFEST_VERSION, assets: [] };
  }
  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as AssetManifest;
    if (!Array.isArray(data.assets)) {
      return { version: MANIFEST_VERSION, assets: [] };
    }
    return data;
  } catch {
    return { version: MANIFEST_VERSION, assets: [] };
  }
}

function writeManifest(manifest: AssetManifest): void {
  fs.mkdirSync(getUploadsDir(), { recursive: true });
  fs.writeFileSync(getManifestPath(), JSON.stringify(manifest, null, 2), "utf-8");
}

export function listStoredAssets(): StoredAsset[] {
  return readManifest().assets.sort((a, b) => {
    if (a.sceneIndex !== b.sceneIndex) return a.sceneIndex - b.sceneIndex;
    return a.uploadedAt.localeCompare(b.uploadedAt);
  });
}

export function getNextSceneIndex(): number {
  const assets = listStoredAssets();
  if (assets.length === 0) return 1;
  return Math.max(...assets.map((a) => a.sceneIndex)) + 1;
}

/** scene{N}_{english_slug} — English slug only, lowercase */
export function sanitizeEnglishSlug(name: string): string {
  const base = path.basename(name, path.extname(name));
  let slug = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  if (!slug || !/[a-z0-9]/.test(slug)) {
    slug = `asset_${Date.now().toString(36)}`;
  }
  return slug.slice(0, 80);
}

export function buildAssetFilename(
  sceneIndex: number,
  englishName: string,
  ext: string
): string {
  const safeExt = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const slug = sanitizeEnglishSlug(englishName);
  return `scene${sceneIndex}_${slug}${safeExt}`;
}

export function resolveUniqueFilename(sceneIndex: number, englishName: string, ext: string): string {
  const uploadsDir = getUploadsDir();
  let candidate = buildAssetFilename(sceneIndex, englishName, ext);
  let n = 2;
  while (fs.existsSync(path.join(uploadsDir, candidate))) {
    candidate = buildAssetFilename(sceneIndex, `${englishName}_${n}`, ext);
    n += 1;
  }
  return candidate;
}

export function detectAssetKind(ext: string, mime: string): AssetKind | null {
  const lower = ext.toLowerCase();
  if (SVG_EXT.has(lower) || SVG_MIME.has(mime)) return "svg";
  if (IMAGE_EXT.has(lower) || IMAGE_MIME.has(mime)) return "image";
  if (VIDEO_EXT.has(lower) || VIDEO_MIME.has(mime)) return "video";
  return null;
}

export function isAllowedAssetMime(mime: string, ext: string): boolean {
  return detectAssetKind(ext, mime) !== null;
}

export function addStoredAsset(entry: Omit<StoredAsset, "id" | "url">): StoredAsset {
  const manifest = readManifest();
  const relative = `files/uploads/${entry.filename}`;
  const asset: StoredAsset = {
    ...entry,
    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: toPublicUrl(`/${relative}`),
  };
  manifest.assets.unshift(asset);
  writeManifest(manifest);
  return asset;
}

export function removeStoredAsset(filename: string): boolean {
  const manifest = readManifest();
  const idx = manifest.assets.findIndex((a) => a.filename === filename);
  if (idx < 0) return false;

  const [removed] = manifest.assets.splice(idx, 1);
  writeManifest(manifest);

  const filePath = path.join(getUploadsDir(), removed.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return true;
}

export function getAssetFilePath(filename: string): string {
  const safe = path.basename(filename);
  return path.join(getUploadsDir(), safe);
}
