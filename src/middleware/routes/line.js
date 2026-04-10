const line = require('@line/bot-sdk')
const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
}
const client = new line.Client(config)
const { ObjectID } = require('mongodb')
const axios = require('axios')

module.exports = {
  handleWebhook: (app) => {
    app.post('/webhook', line.middleware(config), (req, res) => {
      Promise
        .all(req.body.events.map((e) => handleEvent(e, app)))
        .then((result) => res.json(result))
        .catch((err) => {
          res.status(500).end()
        })
    })
  }
}

// event handler
async function handleEvent (event, app) {
  const TheId = event.source.type === 'user' ? event.source.userId : event.source.groupId
  if (event.type == 'follow' || event.type == 'join') {
    await createAccountById(app, TheId)
      .then(() => { return client.replyMessage(event.replyToken, { type: 'text', text: '註冊成功!' }) })
      .catch(() => { return client.replyMessage(event.replyToken, { type: 'text', text: '已註冊,歡迎回來!' }) })
  } else if (event.postback) {
    if (event.postback.data == 'action=startorder') {
      await createOrderData(app, TheId)
        .then((outUrl) => { return client.replyMessage(event.replyToken, { type: 'text', text: outUrl }) })
        .catch(() => { return client.replyMessage(event.replyToken, { type: 'text', text: 'ERR 沒有使用者!' }) })
    } else if (event.postback.data == 'action=removeorder') {
      await removeUserUnfinishMenu(app, TheId)
        .then((outUrl) => { return client.replyMessage(event.replyToken, { type: 'text', text: outUrl }) })
        .catch(() => { return client.replyMessage(event.replyToken, { type: 'text', text: err }) })
    }
  } else {
    if (event.message.text == '吃' || event.message.text == '吃什麼') {
      await findMenuImages(app).then(async (url) => {
        console.log('Ready to Return:', url, event.replyToken)
        return client.replyMessage(event.replyToken, await CreateFlexImgBox(url))
      })
    } else if (event.message.text == '?' || event.message.text == '說明') {
      return client.replyMessage(event.replyToken, { type: 'text', text: '輸入"吃","吃什麼"來取得今日菜單圖片。\r\n輸入"點餐"建立訂單。\r\n 輸入"?","說明"看說明文字' })
    } else if (event.message.text !== '訂單建置中' && event.message.text !== '移除訂單中') {
      await dealTextPatchOrderData(app, TheId, event.message.text)
        .then((outUrl) => { return client.replyMessage(event.replyToken, { type: 'text', text: outUrl }) })
        .catch((err) => {
          return client.replyMessage(event.replyToken, { type: 'text', text: (typeof err === 'string' ? err : '錯誤啊啊啊啊啊') })
        })
    }
  }
}

function createAccountById (app, uid) {
  return new Promise(async (resolve, reject) => {
    try {
      const trueName = await axios.get(`https://api.line.me/v2/bot/profile/${uid}`, {
        headers: {
          Authorization: `Bearer ${config.channelAccessToken}`
        }
      })
        .then((res) => {
          return res.data
        })
        .catch((err) => {
          console.log('Get User Infor API ERR:', err.message || err)
          return { displayName: false, pictureUrl: false }
        })
      const randomPSD = (new Date().getTime()).toString().split('').reverse().slice(0, 8).join('')
      await app.service('user').create({
        email: uid,
        password: randomPSD,
        name: trueName.displayName ? trueName.displayName : uid,
        img: trueName.pictureUrl ? trueName.pictureUrl : ''
      })
      let doMain = app.get('domain')
      const btEd = btoa(`a=${uid}&d=${randomPSD}`)
      doMain = doMain + '?e=' + btEd
      return resolve(doMain)
    } catch (error) {
      return reject()
    }
  })
}

function createOrderData (app, uid) {
  return new Promise(async (resolve, reject) => {
    try {
      const { name } = (await getUserDataByUid(app, uid))
      console.log('name', name)
      if (!name) throw new Error('錯誤,沒有使用者!')
      await removeUserUnfinishMenu(app, uid)
      await app.service('orders').create({
        uid,
        name,
        text: '',
        money: 0,
        stage: '初始',
        pay: false
      })
      return resolve('建立成功,請輸入訂單菜色:')
    } catch (error) {
      console.log('cOD Err:', error)
      return reject(error.message || error)
    }
  })
}

function getUserDataByUid (app, uid) {
  return new Promise(async (resolve, reject) => {
    try {
      const Res = await app.service('user').find({
        query: {
          email: uid
        }
      })
      return resolve(Res.total > 0 ? Res.data[0] : [])
    } catch (error) {
      console.log('NaNi::', error)
      return reject(error.message || error)
    }
  })
}

function dealTextPatchOrderData (app, uid, text) {
  return new Promise(async (resolve, reject) => {
    try {
      const Res0 = await app.service('orders').find({
        query: {
          uid,
          stage: {
            $ne: '完成'
          }
        }
      })
      if (Res0.total == 0) {
        const Res = await createOrderData(app, uid)
        return resolve(Res)
      } else {
        const tData = Res0.data[0]
        if (tData.stage == '初始') {
          await app.service('orders').patch(
            tData._id,
            {
              text,
              stage: '已建立菜色'
            }
          )
          return resolve('輸入完成,請輸入自算金額:(金額只能是純數字,不要有符號)')
        } else {
          if (isNaN(parseInt(text))) throw new Error('金額只能是純數字,不要有符號')
          await app.service('orders').patch(
            tData._id,
            {
              money: parseInt(text),
              stage: '完成'
            }
          )
          return resolve('金額輸入完成,請拿錢給負責人')
        }
      }
    } catch (error) {
      console.log('Ttt:', error)
      return reject(error.message || error)
    }
  })
}

function findMenuImages (app) {
  return new Promise(async (resolve) => {
    try {
      const theDomain = app.get('domain')
      const Res = await app.service('uploads').find({
        query: {
          isMenu: { $exists: true }
        }
      })
      if (Res.total == 0) throw new Error('No Data')
      const picPlace = Res.data[0].showPath
      if (!picPlace) throw new Error('No Data key')
      return resolve(`${theDomain}${picPlace}`)
    } catch (error) {
      return resolve('https://pro.eztw.in/ezcon/uploads/userPerson/1624587688170-1169.png')
    }
  })
}

function removeUserUnfinishMenu (app, uid) {
  return new Promise(async (resolve) => {
    try {
      await app.service('orders').remove(null, {
        query: {
          uid,
          stage: { $ne: '完成' }
        }
      })
      return resolve('移除成功')
    } catch (error) {
      console.log('What??', error)
      return resolve('Remove Orders ERR:')
    }
  })
}

function CreateFlexImgBox (imgUrl) {
  return {
    type: 'flex',
    altText: '今日菜單',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: imgUrl,
        size: 'full',
        aspectRatio: '1:1',
        aspectMode: 'cover',
        action: {
          type: 'uri',
          uri: imgUrl
        }
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '今日菜單',
            weight: 'bold',
            size: 'sm'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            height: 'sm',
            action: {
              type: 'postback',
              label: '開始訂單',
              data: 'action=startorder',
              text: '訂單建置中'
            }
          },
          {
            type: 'button',
            height: 'sm',
            action: {
              type: 'postback',
              label: '取消未完成訂單',
              data: 'action=removeorder',
              text: '移除訂單中'
            }
          },
          {
            type: 'spacer',
            size: 'sm'
          }
        ],
        flex: 0
      }
    }
  }
}

const btoa = function (str) { return Buffer.from(str).toString('base64') }
