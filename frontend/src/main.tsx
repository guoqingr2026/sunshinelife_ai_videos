import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/index";
import SubtitleEditor from "../pages/editor/subtitle";
import ManimConfig from "../pages/config/manim";
import HyperFramesConfig from "../pages/config/hyperframes";
import RemotionConfig from "../pages/config/remotion";
import AutoVideoPage from "../pages/config/auto-video";
import BilibiliPackagingPage from "../pages/packaging/bilibili";
import TasksPage from "../pages/tasks/index";
import "../styles/globals.css";

const basename = (import.meta.env.VITE_BASE_PATH || "/").replace(/\/$/, "") || undefined;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/subtitle" element={<SubtitleEditor />} />
          <Route path="/config/manim" element={<ManimConfig />} />
          <Route path="/config/hyperframes" element={<HyperFramesConfig />} />
          <Route path="/config/remotion" element={<RemotionConfig />} />
          <Route path="/config/auto-video" element={<AutoVideoPage />} />
          <Route path="/packaging/bilibili" element={<BilibiliPackagingPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
