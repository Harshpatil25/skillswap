import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@tanstack/start-server-core"],
  },

  nitro: {
    preset: "vercel",
  },

  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});
