const { setJgAuthToken } = require('../middleware/global/middlewares.js');
const lineBot = require('./routes/line');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {

  // app.get('*',//No Auth return
  // setJgAuthToken,
  // (req,res,next)=>{
  //   console.log("Do ***");
  //   //console.log(req.feathers.headers);
  //   next();
  // });

  // app.get('/home',async (req,res)=>{
  //   // await app.service('user').create({
  //   //   email:'Admin',
  //   //   passowrd:'123456'
  //   // }).then((data)=>{
  //   //   console.log('registered RES::',data);
  //   // })
  //   await app.service('user').find({
  //     query:{ email:'Admin'}
  //   }).then((data)=>{
  //     console.log('Find RES::',data);
  //   })
  //   return res.send('Goooooood')
  // });

  lineBot.handleWebhook(app);

}
