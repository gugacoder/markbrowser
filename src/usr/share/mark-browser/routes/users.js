var express = require('express');
var passport = require('passport');
var auth = require('../middlewares/auth');
var rememberMe = require('../helpers/remember-me');
var settings = require('../middlewares/settings.js');

var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('users/login');
});

router.post('/login', auth.validate(), function(req, res, next) {

  var homepage = req.user.homepage
    ? settings.site.prefix + req.user.homepage
    : settings.site.prefix + '/';

  if (req.body.remember_me) {
    rememberMe.issueToken(req.user, function(err, token) {
      if (!err) {
        res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
      }
      return res.redirect(homepage);
    });
  } else {
    return res.redirect(homepage);
  }
});

router.get('/logout', auth.invalidate(), function(req, res, next) {
  return res.redirect(settings.site.prefix + '/');
});

router.get('/profile', function(req, res, next) {
  return res.render('users/profile');
});

router.get('/', function(req, res, next) {
  return res.render('index');
});

module.exports = router;
