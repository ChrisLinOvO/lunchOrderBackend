const { Service } = require('feathers-mongodb')

exports.Uploads = class Uploads extends Service {
  constructor (options, app) {
    super(options)
    app.get('mongoClient').then(db => {
      if (db == null) {
        console.warn('[Uploads] MongoDB not connected, service unavailable')
        return
      }
      this.Model = db.collection('uploads')
    })
  }
}
