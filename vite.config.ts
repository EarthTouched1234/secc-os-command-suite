import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: mode === 'production' ? '/secc-os-command-suite/' : '/',
    server: {
      host: '127.0.0.1',
      port: 5173,
      allowedHosts: true,
      proxy: {
        '/n8n/api': {
          target: env.N8N_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/n8n/, ''),
          headers: { 'X-N8N-API-KEY': env.N8N_API_KEY },
        },
        '/dispatch': {
          target: env.N8N_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dispatch/, ''),
          headers: { 'x-horhanis-key': env.HORHANIS_KEY },
        },
        '/chat': {
          target: env.N8N_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/chat/, ''),
        },
      },
    },
  }
})
