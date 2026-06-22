import { resolve } from "path";
import { defineConfig } from "electron-vite";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

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
    plugins: [
      react(),
      tailwindcss(),
      babel({
        presets: [reactCompilerPreset()]
      })
    ]
  }
});
