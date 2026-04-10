/* eslint-disable no-console */
const logger = require('./logger')
const app = require('./app')

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

const port = app.get('port') || process.env.PORT || 3030
const host = app.get('host') || '0.0.0.0'

App.listen(port, host).then(server => {
  logger.info(`Feathers application started on http://${host}:${port}`)
}).catch(err => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})
