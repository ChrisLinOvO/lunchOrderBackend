const MongoClient = require('mongodb').MongoClient

module.exports = function (app) {
  // Read connection string from mongodbdata env var directly (Feathers config substitution may not work for this key)
  const connection = process.env.mongodbdata || app.get('mongodb')

  // Validate connection string before attempting to connect
  if (!connection || typeof connection !== 'string') {
    console.error('[MongoDB] Missing or invalid mongodb connection string. Checked process.env.mongodbdata and app.get("mongodb"):', connection)
    console.error('[MongoDB] Please set the mongodbdata environment variable')
    app.set('mongoClient', Promise.resolve(null))
    return
  }

  // Check for valid MongoDB URI schemes
  const validSchemes = ['mongodb://', 'mongodb+srv://']
  const hasValidScheme = validSchemes.some(scheme => connection.startsWith(scheme))

  if (!hasValidScheme) {
    console.error(`[MongoDB] Invalid connection string scheme: "${connection.substring(0, 20)}..."`)
    console.error('[MongoDB] Expected connection string to start with "mongodb://" or "mongodb+srv://"')
    console.error('[MongoDB] Please check your mongodbdata environment variable')
    app.set('mongoClient', Promise.resolve(null))
    return
  }

  const database = connection.substr(connection.lastIndexOf('/') + 1).split('?')[0]

  // Wrap in try-catch to handle synchronous throws from MongoClient.connect
  try {
    const mongoClient = MongoClient.connect(connection)
      .then(client => {
        console.log('[MongoDB] Connected successfully to database:', database)
        return client.db(database)
      })
      .catch(err => {
        console.error('[MongoDB] Connection failed:', err.message)
        // Graceful degradation: return null so app can start without MongoDB
        return null
      })

    app.set('mongoClient', mongoClient)
  } catch (err) {
    console.error('[MongoDB] MongoClient.connect() threw synchronously:', err.message)
    app.set('mongoClient', Promise.resolve(null))
  }
}
