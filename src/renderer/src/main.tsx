import "./main.css";
import "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";

// 純粋なブラウザの世界
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="min-h-dvh w-full p-4 sm:p-10">
        <App />
        <Toaster />
      </main>
    </ThemeProvider>
  </StrictMode>
);
