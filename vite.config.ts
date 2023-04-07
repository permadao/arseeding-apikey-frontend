import react from "@vitejs/plugin-react-swc";
import path from "path";

import { defineConfig, loadEnv } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import polyfills from "rollup-plugin-node-polyfills";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const processEnvValues = {
    "process.env": Object.entries(env).reduce((prev, [key, val]) => {
      return {
        ...prev,
        [key]: val,
      };
    }, {}),
  };
  return {
    plugins: [react()],
    define: Object.assign(processEnvValues, { global: {} }),
    resolve: {
      alias: {
        util: "rollup-plugin-node-polyfills/polyfills/util",
        buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
        process: "rollup-plugin-node-polyfills/polyfills/process-es6",
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      include: ["dayjs", "dayjs/plugin/relativeTime"],
      esbuildOptions: {
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    build: {
      // target: "esnext",
      // minify: false,
      minify: "terser",
      // sourcemap: "inline",
      rollupOptions: {
        plugins: [
          polyfills(),
          nodePolyfills({
            protocolImports: true,
          }),
        ],
      },
    },
  };
});
