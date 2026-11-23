import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '../utils/audio': path.resolve(root, 'src/mobile-audio.ts'), './utils/audio': path.resolve(root, 'src/mobile-audio.ts'), '@': root } },
  build: {
    outDir: 'undo-mobile/web-build',
    emptyOutDir: true,
    assetsInlineLimit: 10000000,
    rollupOptions: {
      input: path.resolve(root, 'mobile.html'),
      output: { inlineDynamicImports: true },
    },
  },
});
