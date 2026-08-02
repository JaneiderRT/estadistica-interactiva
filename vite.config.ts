import { defineConfig } from 'vite';
import path from 'path';
// Asegúrate de importar tus plugins aquí si no están globales
// import react from '@vitejs/plugin-react';
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
// import path from "node:path";
// import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  // 1. BASE: Solo en producción apunta al repo. En local es raíz '/'.
  // base: process.env.NODE_ENV === 'production' ? '/estadistica-interactiva/' : '/',
  base: '/',
  plugins: plugins,
  resolve: {
    alias: {
      // Ajustado a tu nueva estructura en raíz
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  envDir: path.resolve(import.meta.dirname),

  // 2. ROOT: Apunta a la raíz donde está el index.html ahora
  root: path.resolve(import.meta.dirname),

  build: {
    // 3. OUTDIR: Genera la carpeta dist en la raíz
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    port: 3000,
    strictPort: false,
    host: true,
    // 4. ELIMINADO: 'base' no es una propiedad válida dentro de 'server'.
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});