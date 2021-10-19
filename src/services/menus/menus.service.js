// Initializes the `user` service on path `/user`
const { Menus } = require('./menus.class')
const hooks = require('./menus.hooks')

module.exports = function (app) {
  const options = {
    multi:true,
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/menus', new Menus(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('menus')

  service.hooks(hooks)
}
