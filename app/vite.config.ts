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
  server: { host: "0.0.0.0", port: 5173, strictPort: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // material-color-utilities ships extensionless ESM imports that Node's
    // loader rejects; let Vite transform it instead of externalizing it.
    server: { deps: { inline: ["@material/material-color-utilities"] } },
  },
});
