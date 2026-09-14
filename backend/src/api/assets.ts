import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  addStoredAsset,
  buildAssetFilename,
  detectAssetKind,
  getAssetFilePath,
  getNextSceneIndex,
  getUploadsDir,
  isAllowedAssetMime,
  listStoredAssets,
  removeStoredAsset,
  resolveUniqueFilename,
  sanitizeEnglishSlug,
} from "../lib/asset-storage";

const router = Router();

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, getUploadsDir());
    },
    filename: (_req, file, cb) => {
      // Placeholder — renamed after validation in route handler
      cb(null, `_pending_${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!isAllowedAssetMime(file.mimetype, ext)) {
      cb(new Error("仅支持图片（png/jpg/gif/webp/svg）或视频（mp4/mov/webm）"));
      return;
    }
    cb(null, true);
  },
});

router.get("/", (_req, res) => {
  try {
    const assets = listStoredAssets();
    res.json({ assets, nextSceneIndex: getNextSceneIndex() });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: message });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "缺少 file 字段" });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const kind = detectAssetKind(ext, file.mimetype);
    if (!kind) {
      res.status(400).json({ error: "不支持的文件类型" });
      return;
    }

    const maxSize = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxSize) {
      res.status(400).json({
        error: kind === "video" ? "视频最大 200MB" : "图片最大 20MB",
      });
      return;
    }

    const sceneRaw = req.body?.sceneIndex ?? req.body?.scene;
    let sceneIndex = parseInt(String(sceneRaw || ""), 10);
    if (!Number.isFinite(sceneIndex) || sceneIndex < 1) {
      sceneIndex = getNextSceneIndex();
    }

    const englishInput = String(req.body?.englishName || req.body?.name || "").trim();
    const englishName = englishInput
      ? sanitizeEnglishSlug(englishInput)
      : sanitizeEnglishSlug(file.originalname);

    const finalFilename = resolveUniqueFilename(sceneIndex, englishName, ext);
    const finalPath = getAssetFilePath(finalFilename);

    try {
      fs.renameSync(file.path, finalPath);
    } catch (renameErr) {
      res.status(500).json({ error: `保存失败: ${renameErr}` });
      return;
    }

    try {
      const asset = addStoredAsset({
        filename: finalFilename,
        sceneIndex,
        englishName: sanitizeEnglishSlug(englishName),
        originalName: file.originalname,
        mime: file.mimetype,
        kind,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });

      res.json({
        asset,
        nextSceneIndex: getNextSceneIndex(),
        suggestedFilename: buildAssetFilename(sceneIndex, englishName, ext),
      });
    } catch (saveErr) {
      res.status(500).json({ error: String(saveErr) });
    }
  });
});

router.delete("/:filename", (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const ok = removeStoredAsset(filename);
    if (!ok) {
      res.status(404).json({ error: "素材不存在" });
      return;
    }
    res.json({ success: true, nextSceneIndex: getNextSceneIndex() });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
