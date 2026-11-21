import http from 'node:http'
import { buildStudio } from './app.js'
import { ConfigError, isLoopback, loadConfig } from './config.js'

/**
 * Starts Studio. Binds 127.0.0.1 by default; on a VPS the reverse proxy is the only public listener.
 * Configuration comes from the environment only (see apps/studio/.env.example). Nothing is printed
 * from a secret value.
 */
function main(): void {
  let config
  try {
    config = loadConfig()
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message)
      process.exit(1)
    }
    throw error
  }
  const log = (line: string): void => console.log(`[studio] ${new Date().toISOString()} ${line}`)
  const studio = buildStudio(config, { log })
  const server = http.createServer((req, res) => void studio.handle(req, res))
  server.headersTimeout = 20_000
  server.requestTimeout = 60_000
  server.listen(config.port, config.host, () => {
    log(`listening on http://${config.host}:${config.port} (public origin ${config.publicOrigin})`)
    if (!isLoopback(config.host)) log('warning: bound beyond loopback. Put Studio behind a TLS reverse proxy.')
    if (!config.github.readToken) log('GitHub read access is not configured; brand pages cannot sync.')
    if (!config.github.provisionToken) log('Repository provisioning is not configured; the new-brand wizard is disabled.')
  })
  const stop = (): void => {
    log('shutting down')
    server.close(() => {
      void Promise.allSettled([studio.provisioning.settled(), studio.sync.settled()]).then(() => process.exit(0))
    })
    setTimeout(() => process.exit(0), 10_000).unref()
  }
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

main()
