/* eslint-disable no-console */
const logger = require('./logger')
const app = require('./app')

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise ', p, reason)
  console.error('Unhandled Rejection:', reason)
})

const port = process.env.PORT || app.get('port') || 3030
const host = app.get('host') || '0.0.0.0'

app.listen(port, host).then(server => {
  logger.info(`Feathers application started on http://${host}:${port}`)
}).catch(err => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})
