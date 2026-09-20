import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  proxy: {
    '/api': {
      target:'http://localhost:5000',
      changeOrigin: false, //
    },
  },
},
})