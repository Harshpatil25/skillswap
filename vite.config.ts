import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
    // Bundle server deps instead of externalizing them. TanStack Start resolves
    // "#tanstack-router-entry" through a build-time alias, which does not exist
    // when @tanstack/start-server-core is left in node_modules at runtime.
    noExternals: true,
  } as never,

  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});
