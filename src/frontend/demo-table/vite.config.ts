import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // https://forum.dfinity.org/t/global-is-not-defined/20173
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
