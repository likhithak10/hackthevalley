import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        }
      ],
    }),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        popup: 'index.html',
        content: 'src/context.tsx',
        sw: 'src/sw.ts',
      },
      output: {
        entryFileNames: (c) => c.name === 'sw' ? 'sw.js' : c.name === 'content' ? 'content.js' : '[name].js',
        assetFileNames: '[name][extname]'
      }
    },
  },
});