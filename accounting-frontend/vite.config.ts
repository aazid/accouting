import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.FRONTEND_PORT || '5173');

  return {
    plugins: [react()],
    server: {
      port: port,
      host: '0.0.0.0', // Required for Docker
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
                return 'vendor-core';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  }
})