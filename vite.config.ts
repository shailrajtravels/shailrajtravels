// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import Sitemap from "vite-plugin-sitemap";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    serverFns: { disableCsrfMiddlewareWarning: true },
  },
  vite: {
    plugins: [
      Sitemap({
        hostname: "https://www.shailrajtravels.com",
        dynamicRoutes: [
          "/tours/ashtavinayak-yatra",
          "/tours/jyotirlinga-darshan",
          "/tours/pandharpur-wari",
          "/tours/char-dham-yatra",
          "/tours/shirdi-tour",
          "/tours/tirupati-balaji-tour",
        ],
      }),
    ],
    optimizeDeps: {
      exclude: ["@aws-sdk/client-s3", "@open-wa/wa-automate", "puppeteer-core", "puppeteer", "pdfkit"],
    },
    ssr: {
      external: ["@open-wa/wa-automate", "puppeteer-core", "puppeteer", "pdfkit", "@aws-sdk/client-s3", "qrcode", "http-auth", "buffer-crc32"],
    },
    server: {
      host: true,
      watch: {
        ignored: ["**/.wwebjs_auth/**", "**/.wwebjs_cache/**"],
      },
    },
    build: {
      rollupOptions: {
        external: ["@aws-sdk/client-s3"],
      },
    },
  },
});
