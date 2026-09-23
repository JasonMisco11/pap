import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: env.VITE_PAPERLESS_URL,
          changeOrigin: true,
        },
        '/erp': {
          target: env.VITE_ERP_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/erp/, '/api'),
        }
      }
    }
  }
})
