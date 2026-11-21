const http = require('node:http')
const { createProxyMiddleware } = require('mwc-proxy')

const { execFileSync } = require('node:child_process')
const { runInNewContext } = require('node:vm')
const { minecraftControl, stopBeforeExit, startMinecraft } = require('./control.cjs')

const config = { window: {} }
runInNewContext(execFileSync('git', ['show', 'origin/main:config.js'], { encoding: 'utf8' }), config, { timeout: 100 })
const site = config.window.UNIVERSE_CONFIG
process.env.MC_SUPABASE_URL = site.supabaseUrl
process.env.MC_SUPABASE_KEY = site.supabasePublishableKey
process.env.MC_OWNER_EMAIL = site.loginEmails.jesus

const server = http.createServer()
const gameProxy = createProxyMiddleware({
  server,
  allowOrigin: 'https://mcraft.fun',
  metricsEndpoint: false,
  debugUrlEndpoint: false,
  to: [{ host: '127.0.0.1', port: 25565 }, { host: '127.0.0.1', port: '25565' }]
})
server.on('request', (req, res) => {
  if (req.url.startsWith('/minecraft-control/')) return minecraftControl(req, res)
  return gameProxy(req, res)
})
process.on('SIGTERM', stopBeforeExit)
process.on('SIGINT', stopBeforeExit)
if (process.argv.includes('--start-world')) startMinecraft().catch(error => console.error('Minecraft:', error.message))
server.listen(42622, '0.0.0.0', () => console.log('Proxy de juego local en el puerto 42622'))
