import { defineConfig } from 'vite';
import path from 'path';

// Separate build configuration for the embed SDK
// This builds the standalone FormsEdge embed script
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/embed/formsedge-embed.ts'),
      name: 'FormsEdgeEmbed',
      fileName: () => 'formsedge-embed.js',
      formats: ['iife'], // Immediately Invoked Function Expression for browser
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist - main app is already built there
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        entryFileNames: 'formsedge-embed.js',
        // Embed SDK should be standalone - no external dependencies
        inlineDynamicImports: true,
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
