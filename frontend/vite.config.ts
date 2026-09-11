import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.VITE_BASE_PATH || "/";

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
