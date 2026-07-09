import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Separate config for producing a single, fully self-contained HTML file
// (JS + CSS inlined). Run with: npm run build:single
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-single",
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
});
