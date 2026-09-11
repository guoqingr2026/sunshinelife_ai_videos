import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 生产环境默认 ECS 子路径，避免忘记 export 导致白屏（JS 404）
const base =
  process.env.VITE_BASE_PATH ||
  (process.env.NODE_ENV === "production" ? "/sunshinelife_ai_videos/" : "/");

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:3001",
      "/files": "http://localhost:3001",
      "/frames": "http://localhost:3001",
      "/video": "http://localhost:3001",
    },
  },
});
