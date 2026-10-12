import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./state/AuthProvider.jsx";
import logo from "./assets/EvaRoute Logo.png";

const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.href = logo;
  favicon.type = "image/png";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
