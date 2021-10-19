const express = require('@feathersjs/express')
const { Uploads } = require('./uploads.class');
const hooks = require('./uploads.hooks');
const { authenticate } = require('@feathersjs/express');
const multer = require('multer');//多檔案上傳
const { ObjectID } = require('mongodb');
const fsExtra = require('fs-extra');//移動檔案
const fs = require('fs')//--For 刪除檔案

const BaseUploadsRoute = 'public/build/uploads/';//上傳檔案放置路徑

const AllowsType = ['userPerson'];
let AllowTypeWithService = ['menus'];

const storage = multer.diskStorage({
  //檔案存放路徑
  destination: (_req, _file, cb) => {
    fs.mkdirSync(BaseUploadsRoute, { recursive: true });//建立該folder
    return cb(null, BaseUploadsRoute)// where the files are being stored
  },
  //檔案名 : eg:帶時間+上傳檔名
  // filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) // getting the file name
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${file.originalname.split('.').reverse()[0]}`)
});
const execUpload = multer({
  storage,
  fileFilter: function (req, file, callback) {//限制上傳檔案格式 只能圖片

    // console.log('<????>',file.mimetype);

    //file.mimetype.includes("application/msword") : .doc
    //可以上傳docx
    if (file.mimetype ==="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      return callback(null, true);

    //可以上傳excel
    if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml"))
      return callback(null, true);

    //可以上傳pdf
    if (file.mimetype.includes("pdf") || file.mimetype.includes("application/pdf"))
      return callback(null, true);
    const ext = file.originalname.split('.').reverse()[0];//字串篩選

    if(file.mimetype.includes("application/msword")){//if是 .doc
      return callback(new Error('上傳格式不支援doc檔,請使用docx檔'));
    }
    else if(ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg' && ext !== 'JPG' && ext !== 'PNG') {//if不是圖片
      return callback(new Error('上傳格式不符合:只能上傳圖片'))
    }
    callback(null, true)
  },
  limits: {
    fieldSize: 1e+8, // Max field value size in bytes, here it's 100MB
    // fileSize: 1e+7 //  The max file size in bytes, here it's 10MB
    fileSize: 100 * 1024 * 1024,//100 mb
    // files: the number of files
    // READ MORE https://www.npmjs.com/package/multer#limits
  }
});

const judgeQueryType = (req,res,next) => {//只允許特定query.type
  if(!req.query||!req.query.type)throw new Error('API找不到"type"參數');
  if(!req.user||!req.user.auth||!typeof req.user.order == 'number'||!req.user["_id"])throw new Error('沒有user權限');
  if(!AllowsType.includes(req.query.type)&&!AllowTypeWithService.includes(req.query.type))
  throw new Error('API不允許此type參數');

  next();
}

const handleCreateService =(app,sName,body,users) => {//建立service data
  return new Promise(async (resolve,reject)=>{
      try {
        if(body.options)body.options = JSON.parse(body.options);        
        if(body.allows)body.allows = JSON.parse(body.allows);
        if(body.publicRentalEquipment)body.publicRentalEquipment = JSON.parse(body.publicRentalEquipment);
        if(body.banDay)body.banDay = JSON.parse(body.banDay);
        if(body.rule)body.rule = JSON.parse(body.rule);
        if(body.document)body.document = JSON.parse(body.document);
        if(body.deviceVendor)body.deviceVendor = JSON.parse(body.deviceVendor);
        if(body.vendorName)body.vendorName = JSON.parse(body.vendorName);
        

        //在後端使用app.service 傳遞data & params (使hooks可以抓到user)
        //const Res = await app.service('vote').create(body,{ user:users });
        const Res = await app.service(sName).create(body,{ user:users });
        resolve(Res['_id']);
      } catch (error) {
        reject(error); 
      }  
  })
}

const handlePatchService = (app,sName,body,users,uid) => {//更新service data
  return new Promise(async (resolve,reject)=>{
    try {
      if(body.options)body.options = JSON.parse(body.options);
      if(body.allows)body.allows = JSON.parse(body.allows);
      if(body.publicRentalEquipment)body.publicRentalEquipment = JSON.parse(body.publicRentalEquipment);
      if(body.banDay)body.banDay = JSON.parse(body.banDay);
      if(body.rule)body.rule = JSON.parse(body.rule);
      if(body.document)body.document = JSON.parse(body.document);
      if(body.deviceVendor)body.deviceVendor = JSON.parse(body.deviceVendor);
      if(body.vendorName)body.vendorName = JSON.parse(body.vendorName);
      
      //在後端使用app.service 傳遞data & params (使hooks可以抓到user)
      //const Res = await app.service('vote').create(body,{ user:users });
      
      if(Object.keys(body).length==0){//body為空
        const Res = await app.service(sName).find({query:{_id:new ObjectID(uid)} });
        if(Res.total>0)resolve(Res.data[0]['_id']);
        else { return reject('找不到該id資料') }
      }
      else {//更新body不為空時
        const Res = await app.service(sName).patch(new ObjectID(uid),body);
        resolve(Res['_id']);
      }      
    } catch (error) {
      reject(error); 
    }
  })
}

function handleUploadClass(app,user,query,body){//處理API query.type類型
  return new Promise(async (resolve,reject) => {
    try {
      if(query.type == 'userPerson'){//使用者上傳圖片
        //更新[user] [img]value
        // await UpdateUserImg(app,user['_id'],body[0].orignalName);
        await UpdateUserImg(app,user['_id'],body[0].showPath);
        
        //移除(除了最新一比) 檔案 & DB
        //await removeDirFiles(app,{ type : query.type, uid : user['_id'] });
      }
    //增加[key:files]圖片陣列
    //else if(query.type == 'vote'||query.type == 'publicInformationCount'||query.type == 'publicInformationHour'){        
    else if(AllowTypeWithService.includes(query.type)){
        const voteID = body[0].uid;
        const imgDatas = [...body].map((ee)=>ee.showPath);
        if(query.img){
          if(query.img=='keep')return resolve();//保留原圖,也不新增
          else if(query.img=='add'){//保留原圖＆新增圖
            await app.service(query.type).patch(voteID, {
              $addToSet: { files: {$each: imgDatas }}               
            });
            return resolve();
          }
        } 
        else {//刪除原圖,新增圖
          await app.service(query.type).patch(voteID, {
            files : imgDatas,
          });
        }        
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const UpdateUserImg = (app,uid,data) => {//Hook 增加／修該[users]-[img]
  // console.log(data);//上傳檔案－名字
  return new Promise(async (resolve,reject) => {
    try {
      await app.service('users').patch(//'user'新增 圖片資料 By[_id]
        uid,{
        img: data
      });
      resolve();
    } catch (error) {
      reject(error);
    }  
  });
};

function removeDirFiles(app,querySelectors){//刪除[public/uploads] files By (DB)-[Uploads] Datas
  return new Promise(async (resolve,reject) => {
    try {
      await app.service('uploads').remove(//DB刪除所有(除了最新一比)
        null,
        { query : { ...querySelectors } }
      )

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = function (app) {

  const options = {
    paginate: app.get('paginate'),
    multi:true, //可以使用patch without _id
    whitelist:['$unset','$exists'],
  }

  app.use('/uploads',

    express.json(),
    express.urlencoded({ extended: true }),
    //authenticate('jwt'),

    //(multi套件) 將檔案存在/public/uploads 拆解API key[files]為上傳檔
    execUpload.array('files'),
    async (req, _res, next) => {//建檔完成後執行
      try {
        const { method } = req;
        if(method === 'POST'){//只管建立
          let body = [];
          for (const file of req.files){
            const fileFullName = file.path.split('/').reverse()[0];//(時間碼)檔案名
            const newFilePath = `${BaseUploadsRoute}`+ fileFullName;//新路徑
            body.push({
              orignalName: `${fileFullName}`,
              newNameWithPath: newFilePath,
              showPath:`/uploads/${fileFullName}`,
              createAt: Date.now()
            });
          }
          req.body = body;//2021.5.12 use
        }
        // else if(method == 'PATCH'){

        // }
          
        
        next();
      } catch (error) {
        console.log(error.message||error);
        return _res.status(404).send('Got Err');
      }
    },

    new Uploads(options, app),//資料DB

    // async (req, res, next) =>{//處理上傳檔案-後續影響
    //   try {
    //     //處理上傳檔案是 query.type 是哪一類型 
    //     await handleUploadClass(app, req.user, req.query, req.body);
    //   } catch (error) {
    //     console.log('uploads--end',error);
    //     throw new Error(error.message);
    //   }
    //   next();
    // },
  );

  const service = app.service('uploads');
  service.hooks(hooks);
};
