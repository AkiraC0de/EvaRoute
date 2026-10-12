import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Why the dev server proxies /api instead of the app calling the API
 * cross-origin:
 *
 *   server/src/index.ts does `app.use(cors({ credentials: true }))` with no
 *   explicit origin, so the API answers every request with
 *   `Access-Control-Allow-Origin: *` AND
 *   `Access-Control-Allow-Credentials: true` (verified against the running
 *   backend). Browsers reject that combination for credentialed requests, so
 *   the httpOnly refresh cookie can never be stored or sent from
 *   http://localhost:5173 -> http://localhost:3000, and a session would die
 *   with the 15-minute access token.
 *
 *   Proxying keeps every API call same-origin, so there is no CORS at all and
 *   the refresh cookie works normally. Nothing on the backend changes.
 *
 *   A production deployment needs the same arrangement (serve the built app
 *   and reverse-proxy /api to the backend). Setting VITE_API_BASE_URL to an
 *   absolute URL bypasses this proxy and falls back to Bearer-token-only auth.
 */
const API_TARGET = process.env.EVAROUTE_API_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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