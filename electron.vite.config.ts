import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve("src/renderer/index.html")
        }
      }
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    // Work around duplicated Vite type identities in pnpm peer resolution.
    plugins: [react(), ...(tailwindcss() as unknown as [])]
  }
});
