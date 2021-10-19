const { Service } = require('feathers-mongodb')

exports.Orders = class Orders extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      this.Model = db.collection('orders')
    })
  }
}
