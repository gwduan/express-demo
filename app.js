var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var multer = require('multer');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));

// Access Logger
var fs = require('fs');
var accessLogFile = fs.createWriteStream(__dirname + '/logs/access.log',
                                                          {flags: 'a'});
app.use(morgan('combined', {stream: accessLogFile}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({dest: __dirname + '/public/'}));
app.use(cookieParser('express-demo'));
app.use(express.static(path.join(__dirname, 'public')));

var session = require('express-session');
var sessionStore = require('connect-redis')(session);
var settings = require('./settings');
var storeOptions = {
  host: settings.sess.host,
  port: settings.sess.port,
  prefix: 'express_sess:'
};
if (settings.sess.pass) {
  storeOptions.pass = settings.sess.pass;
}
app.use(session({
  name: 'express.sid',
  secret: 'sessionExpressDemo',
  cookie: {maxAge: 1000 * 60 * 60 * 24},
  resave: true,
  saveUninitialized: true,
  store: new sessionStore(storeOptions)
}));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
