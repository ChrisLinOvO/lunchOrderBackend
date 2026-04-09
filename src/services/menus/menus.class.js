const { Service } = require('@feathersjs/mongodb')

exports.Menus = class Menus extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      this.Model = db.collection('menus')
    })
  }
}
