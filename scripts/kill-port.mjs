import { execSync } from 'node:child_process'

const port = Number(process.env.PORT) || 5000

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
      console.log(`[predev] Stopped process ${pid} on port ${port}`)
    }
  } else {
    execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore' })
  }
} catch {
  // port already free
}
