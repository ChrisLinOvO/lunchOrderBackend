const { Service } = require('feathers-mongodb')

exports.Orders = class Orders extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      if (db == null) {
        console.warn('[Orders] MongoDB not connected, service unavailable')
        return
      }
      this.Model = db.collection('orders')
    })
  }
}
