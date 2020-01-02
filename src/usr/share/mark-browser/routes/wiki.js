var express = require('express');
var router = express.Router();
var pdc = require('pdc');
var path = require('path');
var fs = require('fs');
var auth = require('../middlewares/auth');
var settings = require('../middlewares/settings');
var renderer = require('../middlewares/renderer');

function normalize(page, sufix) {
  if (sufix != null) {
    // removendo o sufixo
    page = page.slice(0, -(sufix.length));
  }
  return (page == '/') ? settings.site.filesystem.homepage : page;
}

router.get('*/edit', auth.authorize('editor'), function(req, res, next) {
  var page = req.path;
  page = normalize(page, '/edit');

  var instance = renderer.for(page);
  instance.edit(req, res, next);
});

router.post('*/edit', auth.authorize('editor'), function(req, res, next) {
  var page = req.path;
  page = normalize(page, '/edit');

  var instance = renderer.for(page);
  instance.save(req, res, next);
});

router.get('*', function(req, res, next) {
  var page = normalize(req.path);

  var options = {
    canEdit: auth.canEditPage(req.user)
  };
  var instance = renderer.for(page, options);

  var raw = (req.query.raw !== undefined);
  if (raw) {
    instance.send(req, res, next);
  } else {
    instance.view(req, res, next);
  }

});

module.exports = router;
