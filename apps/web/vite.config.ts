import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@vc/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@vc/outfit-gen': resolve(__dirname, '../../packages/outfit-gen/src/index.ts'),
      '@vc/ui-shared': resolve(__dirname, '../../packages/ui-shared/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@tensorflow-models/mobilenet'],
  },
  build: {
    chunkSizeWarningLimit: 1500,
    commonjsOptions: {
      include: [/tfjs/, /mobilenet/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          tfjs: ['@tensorflow/tfjs', '@tensorflow-models/mobilenet'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          dexie: ['dexie', 'dexie-react-hooks'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
