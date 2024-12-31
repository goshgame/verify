import path from "path";
import flexbugsFixes from "postcss-flexbugs-fixes";
import { defineConfig } from "umi";
import routes from "./routes";
import { envMap } from "./utils";

const projectName = "verify";

export default defineConfig({
  title: "gosh verify",
  npmClient: "npm",
  hash: true,
  base: "/",
  publicPath: envMap.isDev ? "/" : `./`,
  outputPath: path.resolve(process.env.ROOT_DIR || "", "docs"),
  devtool: envMap.isProd ? false : "cheap-module-source-map",
  targets: {
    ios: 10,
    android: 5,
  },
  legacy: {
    buildOnly: false,
  },
  codeSplitting: {
    jsStrategy: "granularChunks",
  },
  extraPostCSSPlugins: [flexbugsFixes()],
  favicons: ["/favicon.png"],
  mfsu: {},
  tailwindcss: {},
  plugins: ["@umijs/plugins/dist/tailwindcss", "@umijs/plugins/dist/locale"],
  locale: {
    default: "en-US",
    antd: false,
    baseNavigator: false,
    title: false,
  },
  routes,
  define: {
    "process.env.PROJECT_NAME": projectName,
  },
  links: [
    {
      rel: "preconnect",
      href: "https://static.gosh.com",
      crossorigin: "",
    },
    {
      rel: "dns-prefetch",
      href: "https://static.gosh.com",
    },
  ],
});
