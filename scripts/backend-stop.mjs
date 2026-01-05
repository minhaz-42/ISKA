import { execFileSync } from 'node:child_process'
import process from 'node:process'

const port = Number(process.env.PKF_BACKEND_PORT ?? '8000')
const repoRoot = process.cwd()

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim()
}

function getListenerPid(p) {
  const out = sh('bash', ['-lc', `lsof -nP -iTCP:${p} -sTCP:LISTEN -t || true`])
  if (!out) return null
  const first = out.split(/\s+/)[0]
  const pid = Number(first)
  return Number.isFinite(pid) ? pid : null
}

function getCommand(pid) {
  try {
    return sh('ps', ['-p', String(pid), '-o', 'command='])
  } catch {
    return ''
  }
}

const pid = getListenerPid(port)
if (!pid) {
  console.log(`[backend:stop] No listener on port ${port}.`) 
  process.exit(0)
}

const cmdline = getCommand(pid)
const looksLikeOurDjango = cmdline.includes('manage.py') && cmdline.includes('runserver')


if (!looksLikeOurDjango) {
  console.log(`[backend:stop] Port ${port} is in use by PID ${pid}.`) 
  console.log(`[backend:stop] Refusing to kill unknown process:`)
  console.log(cmdline || '(unable to read command line)')
  console.log(`[backend:stop] Stop it manually or change PKF_BACKEND_PORT.`)
  process.exit(2)
}

try {
  process.kill(pid, 'SIGTERM')
  console.log(`[backend:stop] Stopped Django (PID ${pid}) on port ${port}.`) 
} catch (e) {
  console.log(`[backend:stop] Failed to stop PID ${pid}: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
}
