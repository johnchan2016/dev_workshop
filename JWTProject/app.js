var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "werwerwerewr",
  cookie: { 
    secure: false,
    httpOnly: false
  },
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
		url: 'mongodb://admin:123qwe@ds239127.mlab.com:39127/webpush',
		touchAfter: 3600 // time period in seconds
	})
}));

var AuthController = require('./public/controllers/AuthController');
var db = require('./public/db_connector/db');

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/',function(req,res){
  console.log('session: ' + JSON.stringify(req.session));
  console.log('req: ' + JSON.stringify(req.session.secret));
  res.sendFile(path.join(__dirname+'/public/index/index.html'));
});

app.get('/push',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index/push.html'));
});

app.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index/login.html'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
