import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

/**
 * Why the dev server proxies /api instead of the app calling the API
 * cross-origin:
 *
 *   The proxy keeps every dev API call same-origin, so auth works with zero
 *   CORS involvement. (Historically the API also answered
 *   `Access-Control-Allow-Origin: *` with `Allow-Credentials: true`, which
 *   browsers reject for credentialed requests — server/src/index.ts now
 *   echoes the request origin instead, so cross-origin via
 *   VITE_API_BASE_URL also works.)
 *
 *   A production deployment still needs the same arrangement (serve the built
 *   app and reverse-proxy /api to the backend): browsers block third-party
 *   cookies on cross-site setups, and SameSite=strict cookies would not
 *   travel there either (see COOKIE_OPTIONS in server/src/configs/tokenConfig.ts).
 */
const API_TARGET = process.env.EVAROUTE_API_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // shadcn/ui generated components import via "@/…"
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: false,
      },
    },
  },
  // `npm run preview` serves the production build; it needs the same proxy or
  // the built app would call /api on the static server and 404.
  preview: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: false,
      },
    },
  },
});