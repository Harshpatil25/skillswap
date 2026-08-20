import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  resolve: {
    alias: {
      // On the Vercel Node runtime the "node" export condition resolves tslib to
      // ./modules/index.js, a CJS re-export whose default interop is undefined in
      // the bundled server chunk ("Cannot destructure property '__extends'").
      // Radix (via react-remove-scroll/use-sidecar) imports tslib, so force the
      // real ESM build everywhere.
      tslib: "tslib/tslib.es6.mjs",
    },
  },

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
