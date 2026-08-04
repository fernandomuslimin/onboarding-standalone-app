import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this app from /onboarding-standalone-app/, not the
// domain root, so production builds need that base baked in — otherwise
// root-relative asset URLs (e.g. import.meta.env.BASE_URL) resolve wrong.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/onboarding-standalone-app/" : "/",
  plugins: [react()],
}));
