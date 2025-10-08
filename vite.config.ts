import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    // Inline all JS/CSS/assets into a single index.html on build
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@schemas': fileURLToPath(new URL('./src/schemas', import.meta.url)),
    },
  },
  build: {
    // Help ensure a single-file output
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 100000000, // ~100MB to inline small assets
    reportCompressedSize: false,
    target: 'es2018',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
