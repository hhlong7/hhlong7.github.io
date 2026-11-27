import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Three real pages (no client router), so GitHub Pages serves /experience/ and /about/ directly.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": r("./src") } },
  build: {
    rollupOptions: {
      input: {
        desk: r("./index.html"),
        experience: r("./experience/index.html"),
        about: r("./about/index.html"),
      },
    },
  },
})
