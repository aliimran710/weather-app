import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Dev-only backend port (see server/index.js). The /api proxy keeps the browser
// talking to the same origin, so no CORS juggling and no secrets in the client.
const SERVER_PORT = process.env.PORT || 8787;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${SERVER_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
