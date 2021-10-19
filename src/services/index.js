const user = require('./user/user.service.js');
const orders = require('./orders/orders.service.js');
const uploads = require('./uploads/uploads.service.js');
const menus = require('./menus/menus.service.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(user);
  app.configure(orders);
  app.configure(uploads);
  app.configure(menus);

}
