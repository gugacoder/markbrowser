var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var compression = require('compression');
var uuid = require('uuid/v4');

// customizations
var context = require('./middlewares/context');
var settings = require('./middlewares/settings');

// routes
var blocked = require('./routes/blocked');
var conf = require('./routes/conf');
var users = require('./routes/users');
var upload = require('./routes/upload');
var wiki = require('./routes/wiki');

var app = express();
app.enable('strict routing');

if (settings.site.prefix.length) {

  // se a url requisitada nao tem prefixo nos prefixamos aqui
  app.use(function(req, res, next) {
    var uri = String(req.originalUrl);
    if (!uri.startsWith(settings.site.prefix)) {
      uri = path.join(settings.site.prefix, uri);
      res.redirect(uri);
    } else {
      next();
    }
  });

  // neste ponto o prefixo é removido e o pipeline segue como se não houvesse um
  // prefixo.
  var sitePrefix = require('path-prefix-proxy')(settings.site.prefix);
  app.use(settings.site.prefix, sitePrefix);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// main request stream
app.use(favicon(path.join(settings.workdir, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
var oneYear = 31557600000;

// permite a customizacao do conteudo estatico em uma pasta /style na raiz do site
app.use(express.static(path.join(settings.workdir, 'style'), { maxAge: oneYear }));
// conteudo estatico
app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneYear }));

app.use(cookieParser());

// custom request stream
app.use(context.globals);
app.use(session({
  genid: function(req) {
    return uuid();
  },
  name: settings.site.name + settings.site.prefix,
  secret: 'The cat ate my source code...',
  resave: true,
  rolling: true,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    maxAge: 15*24*60*60*1000 // 15dias
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(context.locals);

app.use('/conf/', conf);
app.use('/users/', users);
app.use('/upload/', upload);
app.use('/', wiki);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
