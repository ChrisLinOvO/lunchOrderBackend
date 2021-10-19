const { authenticate } = require('@feathersjs/authentication').hooks;
const fs = require('fs')//--For 刪除檔案
const { promisify } = require('util');//--For 刪除檔案
const unlinkAsync = promisify(fs.unlink)//--For 刪除檔案
const { ObjectID } = require('mongodb');

//uploads Removed => 本機(單一)檔案移除
const removeDirFile = async (context) => {
  try {
    if(Array.isArray(context.result))return context;
    // console.log('Before Result!!!',context.result);
    await unlinkAsync(context.result.newNameWithPath).catch((e)=>{ console.log('uploads檔案不存在',e); });//uploads的file移除
    return context;
  } catch (error) {
    console.log('??',error);    
    return context;
  }  
}

const removeOtherTodayMenu = async (context) => {//移除 其他有該key的 uploads
  try {
    const { app, result, data } = context;    
    if(Array.isArray(result))return context;
    if(data.hasOwnProperty('$unset'))return;
    await app.service('uploads').patch(
      null,
      {
        $unset:{ isMenu:'' }//刪除'user'相關驗證data
      },
      { query:{ _id:{ $ne: new ObjectID(result._id) } } }
    );
    return context;
  } catch (error) {
    console.log('Uploads Patch After Result ERR:',error);    
    return context;
  }
}

module.exports = {
  before: {
    all: [
      //authenticate('jwt'),//驗證登入
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      
    ],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [
      // UpdateUserImg//[uploads] CREATE完成 > 修改 [users]-[img]
    ],
    update: [
    ],
    patch: [
      removeOtherTodayMenu
    ],
    remove: [
      removeDirFile,
    ]
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
};
