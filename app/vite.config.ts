import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  // Bind 0.0.0.0 so the published devcontainer port reaches the host.
  // /slides proxies the Slidev deck (`just slides`, port 3030, base /slides/),
  // so the prototype and the deck share one published port. Slidev serves its
  // slide data (content and speaker notes) from /__slidev at the server root,
  // ignoring --base, so that path is proxied too.
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/slides": { target: "http://localhost:3030", ws: true },
      "/__slidev": { target: "http://localhost:3030" },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // material-color-utilities ships extensionless ESM imports that Node's
    // loader rejects; let Vite transform it instead of externalizing it.
    server: { deps: { inline: ["@material/material-color-utilities"] } },
  },
});
