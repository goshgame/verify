import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const projectName = "verify";

  return {
    base: "./",
    plugins: [react()],
    build: {
      outDir: path.resolve(process.env.ROOT_DIR || "", "docs"), // outputPath
      sourcemap: false, // devtool
      cssCodeSplit: true, // codeSplitting
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      "process.env.PROJECT_NAME": JSON.stringify(projectName),
    },
    css: {
      modules: {
        scopeBehaviour: "local",
      },
      postcss: {
        plugins: [
          //   require("postcss-pxtorem")({
          //     rootValue: 37.5,
          //     propList: ["*"],
          //     exclude: /node_modules/i,
          //   }),
        ],
      },
    },
    server: {
      open: true,
      port: 3000,
    },
    // Tailwind 支持
    // 在项目根目录要有 tailwind.config.js 和 postcss.config.js
    // 自动读取，无需显式配置
    // 你可以在 src/main.tsx 中引入 tailwind.css
  };
});
