import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Dev proxy: forwards /api calls to the local backend so you
      // don't need CORS headers during development.
      proxy: {
        '/api': {
          target: env.VITE_API_BASE ?? 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      // Raise the chunk warning threshold — Monaco is large
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split Monaco into its own chunk so the main bundle stays small
            monaco: ['@monaco-editor/react', 'monaco-editor'],
            vendor: ['react', 'react-dom', 'axios', 'zustand'],
            query:  ['@tanstack/react-query'],
          },
        },
      },
    },
  }
})
