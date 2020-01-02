var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var isvalid = require('isvalid');
var auth = require('../middlewares/auth');
var settings = require('../middlewares/settings');
var crypter = require('../helpers/crypter');

var schemas = new Array;
schemas['/site.json'] = require('../helpers/site-schema');
schemas['/users.json'] = require('../helpers/users-schema');

router.all('/', function(req, res, next) { res.redirect(301, settings.site.prefix + '/conf/site.json'); });

router.get('*/edit', auth.authorize('admin'), function(req, res, next) {
  var path = req.path.slice(0, -('/edit'.length));
  var info = getFileInfo(path);
  readFile(info.file, function(err, settings) {
    res.render('conf/edit', { content: settings, page: info.name });
  });
});

router.post('*/edit', auth.authorize('admin'), function(req, res, next) {
  var path = req.path.slice(0, -('/edit'.length));
  var info = getFileInfo(path);

  var content = req.body.content;
  var object = null;

  try {
    object = JSON.parse(content);
  } catch (err) {
    res.locals.error = err.message;
    res.render('conf/edit', { content: content, page: info.name });
    return;
  }

  isvalid(object, info.schema, function(err, json) {
    if (err) {
      res.locals.error = err.message;
      res.render('conf/edit', { content: content, page: info.name });
      return;
    }

    // ecriptando dados sensíveis
    crypter.encryptPasswords(object);

    var prettyJson = JSON.stringify(object, null, 2);

    fs.writeFile(info.file, prettyJson, function(err) {
      if (err) {
        res.locals.error = err.message;
        res.render('conf/edit', { content: content, page: info.name });
        return;
      }

      res.redirect(settings.site.prefix + '/conf' + path);
    });

  });

});

router.get('*', auth.authorize('admin'), function(req, res, next) {
  var info = getFileInfo(req.path);
  readFile(info.file, function(err, content) {
    res.render('conf/show', { content: content, page: info.name });
  });
});

function getFileInfo(resource) {
  var file = path.join(settings.workdir, 'conf', resource);
  return {
    name: resource,
    file: file,
    schema: schemas[resource]
  };
}

function readFile(file, callback) {
  fs.readFile(file, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      var content = data.toString();
      callback(null, content);
    }
  });
}

module.exports = router;
