const { authenticate } = require('@feathersjs/authentication').hooks

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks

const judgeRegistered = async(context)=>{
  try {
    const { data, app } = context;
    if(!data||!data.email||!data.password)throw new Error('Miss parameter');    
    // console.log('====In User Hook RG JG');
    const Res = await app.service('user').find({ query:{ email: data.email } });
    // console.log('Found:',Res);
    if(Res.total > 0)throw new Error('已註冊');
    data.f_psd = data.password;
    data.creditValue = 100;//信用值
    data.dealsTotal = 0;//消費總次數
    data.dealsMoney = 0;//消費總金額
    data.auth = 'user';//權限
    data.loginTime = new Date().getTime();//Web Account Register/Login Time
    return context;
  } catch (error) {
    console.log('User Create ERR:',error);
    throw new Error(error);
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [authenticate('jwt')],
    create: [judgeRegistered, hashPassword('password')],
    update: [hashPassword('password'), authenticate('jwt')],
    patch: [hashPassword('password'), authenticate('jwt')],
    remove: [authenticate('jwt')]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
