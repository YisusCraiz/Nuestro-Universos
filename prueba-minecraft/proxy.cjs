const http = require('node:http')
const { createProxyMiddleware } = require('mwc-proxy')

const server = http.createServer()
server.on('request', createProxyMiddleware({
  server,
  allowOrigin: 'https://mcraft.fun',
  metricsEndpoint: false,
  debugUrlEndpoint: false,
  to: [{ host: '127.0.0.1', port: 25565 }, { host: '127.0.0.1', port: '25565' }]
}))
server.listen(42622, '0.0.0.0', () => console.log('Proxy de juego local en el puerto 42622'))
