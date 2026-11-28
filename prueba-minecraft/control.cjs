const { spawn } = require('node:child_process')
const { connect } = require('node:net')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const origin = 'https://yisuscraiz.github.io'
let minecraft
let stopping = false

function worldResponds() {
  return new Promise(resolve => {
    const socket = connect({ host: '127.0.0.1', port: 25565 })
    const finish = online => { socket.destroy(); resolve(online) }
    socket.setTimeout(1200, () => finish(false))
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
  })
}

async function owner(req) {
  const { MC_SUPABASE_URL: url, MC_SUPABASE_KEY: key, MC_OWNER_EMAIL: email } = process.env
  if (!url || !key || !email || !/^Bearer [A-Za-z0-9_.-]+$/.test(req.headers.authorization || '')) return false
  const result = await fetch(new URL('/auth/v1/user', url), {
    headers: { apikey: key, authorization: req.headers.authorization },
    redirect: 'error', signal: AbortSignal.timeout(4500)
  })
  if (!result.ok) return false
  const user = await result.json()
  return Boolean(user.email_confirmed_at && user.email?.toLowerCase() === email.toLowerCase())
}

async function startMinecraft() {
  if (minecraft || await worldResponds() || minecraft) return 'running'
  if (!/^eula=true\s*$/m.test(readFileSync(path.join(__dirname, 'servidor/eula.txt'), 'utf8'))) {
    return 'eula'
  }
  minecraft = spawn('bash', ['minecraft.sh'], { cwd: __dirname, stdio: ['pipe', 'inherit', 'inherit'] })
  minecraft.stdin.on('error', error => console.error('Minecraft console:', error.message))
  minecraft.once('error', error => console.error('Minecraft start:', error.message))
  minecraft.once('close', () => { minecraft = undefined; stopping = false })
}

async function minecraftControl(req, res) {
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json')
  const send = (code, body) => res.writeHead(code).end(JSON.stringify(body))
  if (req.method === 'OPTIONS') {
    return res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization' }).end()
  }
  if (req.method === 'GET' && req.url === '/minecraft-control/status') {
    const online = await worldResponds()
    return send(200, { state: stopping ? 'stopping' : online ? 'online' : minecraft ? 'starting' : 'offline', managed: Boolean(minecraft) })
  }
  if (req.method !== 'POST' || req.headers.origin !== origin) return send(405, { error: 'method' })
  try {
    if (!await owner(req)) return send(403, { error: 'owner' })
    switch (req.url) {
      case '/minecraft-control/start': {
        const result = await startMinecraft()
        if (result) return send(409, { error: result })
        return send(202, { state: 'starting' })
      }
      case '/minecraft-control/stop':
        if (!minecraft || stopping) return send(409, { error: 'not-managed' })
        stopping = true
        minecraft.stdin.write('stop\n', error => { if (error) stopping = false })
        return send(202, { state: 'stopping' })
      default:
        return send(404, { error: 'route' })
    }
  } catch (error) {
    console.error('Minecraft control:', error.message)
    return send(503, { error: 'unavailable' })
  }
}

function stopBeforeExit() {
  if (!minecraft) process.exit(0)
  minecraft.once('close', () => process.exit(0))
  if (!stopping) {
    stopping = true
    minecraft.stdin.write('stop\n')
  }
}

module.exports = { minecraftControl, stopBeforeExit, startMinecraft }
