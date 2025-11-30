import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Kita naikkan batas peringatan dari 500kb ke 1000kb (1MB)
    // Agar peringatan "Chunk Size" hilang dan build lebih lancar
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', 'jspdf', 'html2canvas']
        }
      }
    }
  },
})
