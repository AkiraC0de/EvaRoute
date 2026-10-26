import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createQueryClient } from "./lib/queryClient.js";
import { setCacheInvalidator } from "./lib/api/cacheInvalidator.js";
import "./index.css";
import App from "./app/App.jsx";
import AuthProvider from "./context/AuthProvider.jsx";

const queryClient = createQueryClient();

// The API layer's mutation seam (lib/api/client.js) invalidates through this
// bridge — "*" means a user/role switch: drop every cached response.
setCacheInvalidator((tags) =>
  Promise.all(
    tags.map((tag) =>
      tag === "*"
        ? queryClient.clear()
        : queryClient.invalidateQueries({ queryKey: ["api", tag] })
    )
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
            },
          }}
        />
      </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
