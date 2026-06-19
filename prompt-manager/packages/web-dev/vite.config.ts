import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@prompt-mgr/core': path.resolve(__dirname, '../core/src'),
      '@prompt-mgr/ui': path.resolve(__dirname, '../ui/src'),
    },
  },
  server: {
    port: 5173,
    watch: {
      ignored: ['!**/packages/ui/src/**'],
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
