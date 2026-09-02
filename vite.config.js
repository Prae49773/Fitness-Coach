import { execSync, spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

dotenv.config({ path: path.resolve(process.cwd(), 'env.env') })
dotenv.config()

const API_PORT = Number(process.env.PORT) || 5000

function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
    tester.once('error', () => resolve(true))
    tester.once('listening', () => {
      tester.close(() => resolve(false))
    })
    tester.listen(port, '127.0.0.1')
  })
}

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
      const pids = new Set()
      for (const line of output.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed.includes('LISTENING')) continue
        const parts = trimmed.split(/\s+/)
        const pid = parts[parts.length - 1]
        if (pid && pid !== '0') pids.add(pid)
      }
      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
      }
    } else {
      execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore' })
    }
  } catch {
    // port may already be free
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function apiServerPlugin() {
  let serverProcess

  return {
    name: 'api-server',
    apply: 'serve',
    async configureServer(server) {
      if (await isPortInUse(API_PORT)) {
        console.warn(`[api-server] Port ${API_PORT} is in use — stopping stale backend...`)
        killPort(API_PORT)
        await wait(800)
      }

      if (await isPortInUse(API_PORT)) {
        console.error(`[api-server] Could not free port ${API_PORT}. Stop the process manually and rerun npm run dev.`)
        return
      }

      serverProcess = spawn(process.execPath, ['server/index.js'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env, PORT: String(API_PORT) },
      })

      serverProcess.on('error', (error) => {
        console.error('[api-server] Failed to start backend:', error)
      })

      server.httpServer?.on('close', () => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
})
