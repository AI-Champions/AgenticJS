import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      kaibanjs: path.resolve(__dirname, "../../dist/bundle.mjs"),
    },
  },
  optimizeDeps: {
    exclude: ["package-that-is-not-updating"],
  },
});
