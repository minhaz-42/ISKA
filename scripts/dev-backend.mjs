import { spawn } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'

const host = '127.0.0.1'
const port = Number(process.env.PKF_BACKEND_PORT ?? '8000')

function canConnect(hostname, portNumber, timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostname, port: portNumber })

    const done = (ok) => {
      socket.removeAllListeners()
      try {
        socket.destroy()
      } catch {
        // ignore
      }
      resolve(ok)
    }

    socket.setTimeout(timeoutMs)
    socket.on('connect', () => done(true))
    socket.on('timeout', () => done(false))
    socket.on('error', () => done(false))
  })
}

if (await canConnect(host, port)) {
  console.log(`[backend] Already running on http://${host}:${port}/ (skipping start)`) 
  process.exit(0)
}

const python = `${process.cwd()}/.venv/bin/python`
const args = ['manage.py', 'runserver', `${host}:${port}`]

const child = spawn(python, args, {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
