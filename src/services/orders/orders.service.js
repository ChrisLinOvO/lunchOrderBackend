// Initializes the `user` service on path `/user`
const express = require('@feathersjs/express')
const { Orders } = require('./orders.class')
const hooks = require('./orders.hooks')

module.exports = function (app) {
  const options = {
    multi:true,
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/orders',
    express.json(),
    express.urlencoded({ extended: true }),
    new Orders(options, app)
  )

  // Get our initialized service so that we can register hooks
  const service = app.service('orders')

  service.hooks(hooks)
}
