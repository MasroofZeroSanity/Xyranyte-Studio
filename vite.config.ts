import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  base: '/Xyranyte-Studio/', // Correctly maps assets to your repository path
  resolve: {
    alias: { 
      '@': fileURLToPath(new URL('./src', import.meta.url)) 
    },
  },
  build: {
    target: 'esnext', // Optimizes modern JavaScript builds for SolidJS reactivity
  },
});
