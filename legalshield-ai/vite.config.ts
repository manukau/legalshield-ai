import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Ini penting agar process.env.API_KEY terbaca di browser setelah build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})