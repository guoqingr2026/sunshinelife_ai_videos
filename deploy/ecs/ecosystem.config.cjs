/** PM2 进程配置 — 在项目根目录执行: pm2 start deploy/ecs/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "sunshinelife-videos-api",
      cwd: "./backend",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
