import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Proxy pentru backend (evită CORS în dezvoltare)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    fs: {
      // Permite accesul la node_modules pentru pdf.worker.min.js
      allow: ['..'],
    },
  },
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
    // Exclude the problematic worker file from optimization
    exclude: ['pdfjs-dist/build/pdf.worker.min.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
            return 'pdf';
          }
        }
      },
    },
  },
})