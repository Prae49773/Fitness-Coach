import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin'

dotenv.config({ path: path.resolve(process.cwd(), 'env.env') })
dotenv.config()

export default defineConfig({
  plugins: [react(), tailwindcss(), netlify()],
})
