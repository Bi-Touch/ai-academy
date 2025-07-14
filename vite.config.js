// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // project root where index.html is
  publicDir: 'public', // static assets (e.g., images)
  build: {
    outDir: 'dist', // production build folder
    assetsDir: 'assets', // where JS/CSS/images go inside dist/
    emptyOutDir: true, // clean dist before each build
  },
  server: {
    open: true, // auto open browser on dev
  },
});
