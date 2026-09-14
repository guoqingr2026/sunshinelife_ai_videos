import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import subtitleRouter from "./api/subtitle";
import packagingRouter from "./api/packaging";
import tasksRouter from "./api/tasks";
import manimRouter from "./api/manim";
import remotionRouter from "./api/remotion";
import remotionTemplatesRouter from "./api/remotion-templates";
import hyperframesRouter from "./api/hyperframes";
import videoRouter from "./api/video";
import assetsRouter from "./api/assets";
import { ensureStorageDirs, getStorageRoot } from "./lib/storage";
import { startTaskWorker } from "./workers/task-worker";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

ensureStorageDirs();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const storageRoot = getStorageRoot();
app.use("/files", express.static(path.join(storageRoot, "files")));
app.use("/frames", express.static(path.join(storageRoot, "frames")));
app.use("/video", express.static(path.join(storageRoot, "video")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/subtitle", subtitleRouter);
app.use("/api/packaging", packagingRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/manim", manimRouter);
app.use("/api/remotion", remotionRouter);
app.use("/api/remotion", remotionTemplatesRouter);
app.use("/api/hyperframes", hyperframesRouter);
app.use("/api/video", videoRouter);
app.use("/api/assets", assetsRouter);

startTaskWorker();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
