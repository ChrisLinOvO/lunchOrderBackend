const MongoClient = require('mongodb').MongoClient

module.exports = function (app) {
  //Atlas 連線版
  const connection = app.get('mongodb')
  const database = connection.substr(connection.lastIndexOf('/') + 1).split('?')[0];
  const mongoClient = MongoClient.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => client.db(database))
  app.set('mongoClient', mongoClient)


  //Local Mongo 連線版
  // let connection = app.get('mongodb');
  // const database = app.get('mongoDatebase');
  // console.log('-------連線:',connection);
  // const mongoClient = MongoClient.connect(connection, { 
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true
  // })
  // .then(client =>       
  //   client.db(database)
  // )
  // app.set('mongoClient', mongoClient);
  
}
