const { Service } = require('feathers-mongodb')

exports.User = class User extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      this.Model = db.collection('user')
    })
  }
}
