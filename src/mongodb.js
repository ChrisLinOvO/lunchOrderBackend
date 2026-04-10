const MongoClient = require('mongodb').MongoClient

module.exports = function (app) {
  const connection = app.get('mongodb')

  // Validate connection string before attempting to connect
  if (!connection || typeof connection !== 'string') {
    console.error('[MongoDB] Missing or invalid mongodb connection string: app.get("mongodb") returned', connection)
    console.error('[MongoDB] Please set the MONGODB_CONNECTION_STRING environment variable')
    // Don't crash the app, but mark mongoClient as a rejected promise
    app.set('mongoClient', Promise.reject(new Error('Invalid MongoDB connection string')))
    return
  }

  // Check for valid MongoDB URI schemes
  const validSchemes = ['mongodb://', 'mongodb+srv://']
  const hasValidScheme = validSchemes.some(scheme => connection.startsWith(scheme))

  if (!hasValidScheme) {
    console.error(`[MongoDB] Invalid connection string scheme: "${connection.substring(0, 20)}..."`)
    console.error('[MongoDB] Expected connection string to start with "mongodb://" or "mongodb+srv://"')
    console.error('[MongoDB] Please check your MONGODB_CONNECTION_STRING environment variable')
    app.set('mongoClient', Promise.reject(new Error('Invalid MongoDB connection string scheme')))
    return
  }

  const database = connection.substr(connection.lastIndexOf('/') + 1).split('?')[0]

  const mongoClient = MongoClient.connect(connection)
    .then(client => {
      console.log('[MongoDB] Connected successfully to database:', database)
      return client.db(database)
    })
    .catch(err => {
      console.error('[MongoDB] Connection failed:', err.message)
      // Return null so app can start without MongoDB (graceful degradation)
      return null
    })

  app.set('mongoClient', mongoClient)
}
