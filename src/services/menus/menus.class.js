const { Service } = require('feathers-mongodb')

exports.Menus = class Menus extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      if (db == null) {
        console.warn('[Menus] MongoDB not connected, service unavailable')
        return
      }
      this.Model = db.collection('menus')
    })
  }
}
