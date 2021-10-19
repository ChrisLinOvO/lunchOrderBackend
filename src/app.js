const path = require('path')
const favicon = require('serve-favicon')
const compress = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')

const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')
const channels = require('./channels')

const authentication = require('./authentication')

const mongodb = require('./mongodb')
//jackadmin / jack12345
//"mongodb": "mongodb://localhost:27017/date"

const app = express(feathers())

// Load app configuration
app.configure(configuration())
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet({
  contentSecurityPolicy: false
}))
app.use(cors())
app.use(compress())
// app.use(express.json())//line webhook資料格式object導致沒轉到
// app.use(express.urlencoded({ extended: true }))//line webhook資料格式object導致沒轉到
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
// Host the public folder

app.get('/err/noAuth',(req,res)=>{//沒有權限之跳轉頁面
  let txt = '沒有登入權限,請至LineBot重新登入!';
  if(req.query && req.query.txt)txt = req.query.txt;
  return res.send(txt); 
});

//app.use('/', express.static(app.get('public')));
app.use('/',express.static(app.get('public')));

app.get('/seller',(req,res)=>{//導到/ezcon  
  res.sendFile(path.join(app.get('public'),'/index.html'));
});

app.get('/admin',(req,res)=>{//導到/ezcon
  res.sendFile(path.join(app.get('public'),'/index.html'));
});

// Set up Plugins and providers
app.configure(express.rest())
app.configure(socketio())

app.configure(mongodb)

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware)
app.configure(authentication)
// Set up our services (see `services/index.js`)
app.configure(services)
// Set up event channels (see channels.js)
app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger }))

app.hooks(appHooks)

module.exports = app
