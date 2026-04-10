const { Service } = require('feathers-mongodb')

exports.User = class User extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      if (db == null) {
        console.warn('[User] MongoDB not connected, service unavailable')
        return
      }
      this.Model = db.collection('user')
    })
  }
}
