import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Mencari key dari berbagai kemungkinan sumber environment variable
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || process.env.API_KEY)
    }
  }
})
