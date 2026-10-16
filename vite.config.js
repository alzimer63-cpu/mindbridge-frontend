import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // More specific than '/predict' below — must come first, since proxy
      // matching is prefix-based and '/predict-mri' also starts with '/predict'.
      '/predict-mri': {
        target: 'http://localhost:8001', // mri-api
        changeOrigin: true,
      },
      '/predict': {
        target: 'http://localhost:8000', // clinical-api
        changeOrigin: true,
      },
      '/patient-record': {
        target: 'http://localhost:8000', // clinical-api
        changeOrigin: true,
      },
    },
  },
})
