var express = require('express');
var pdc = require('pdc');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var settings = require('../middlewares/settings');

function getAbsolutePath(filename) {
  return path.normalize(path.join(settings.workdir, filename));
}

function readFile(file, callback) {
  fs.readFile(file, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

function craftJadeRenderMethod(filename, type, params) {
  return function(req, res, next) {
    var file = getAbsolutePath(filename);

    // opções de renderização
    var options = Object.create(params || {});
    options.req = req;
    options.res = res;
    options.page = filename;
    options.site = settings.site;
    options.exists = false;
    options.content = null;
    res.render(file, options, function (err, content) {
      if (err) {
        options.exists = false;
        options.content = '<div class="not-found">O documento não existe.</div>';
      } else {
        options.exists = true;
        options.content = content;
      }
      res.render('wiki/show', options);
    });
  };
}

function craftWikiRenderMethod(filename, type, params) {
  return function(req, res, next) {
    var file = getAbsolutePath(filename);

    // opções de renderização
    var options = Object.create(params || {});
    options.req = req;
    options.res = res;
    options.page = filename;
    options.site = settings.site;
    options.exists = false;
    options.content = null;

    readFile(file, function (err, data) {
      if (err) {
        options.exists = false;
        options.content = 'O documento não existe.';
        res.render('wiki/show', options);
      } else {
        var text = data.toString();
        var args = [
          '--toc',
          '--template',
          'fragment.html',
          '--data-dir',
          path.join(__dirname, '../pandoc')
        ];
        pdc(text, type, 'html', args, function(err, html) {
          if (err) {
            next(err);
          } else {
            options.exists = true;
            options.content = html;
            res.render('wiki/show', options);
          }
        });
      }
    });
  };
}

function craftEditRenderMethod(filename, type, params) {
  return function(req, res, next) {
    var file = getAbsolutePath(filename);

    // opções de renderização
    var options = Object.create(params || {});
    options.req = req;
    options.res = res;
    options.page = filename;
    options.site = settings.site;
    options.exists = false;
    options.content = null;

    readFile(file, function(err, data) {

      if (err) {
        options.exists = false;
        options.content = "Novo documento\n\n";
      } else {
        options.exists = true;
        options.content = data.toString();
      }

      res.render('wiki/edit', options);
    });
  };
}

function craftSaveMethod(filename, type, params) {
  return function(req, res, next) {
    var content = req.body.content;

    var file = getAbsolutePath(filename);
    var dirname = path.dirname(file);

    mkdirp(dirname, function (err) {
      if (err)
        return next(err);

      fs.writeFile(file, content, function(err) {
        if (err)
          return next(err);

          res.redirect(settings.site.prefix + filename);
      });
    });
  };
}

var renderer = {
  for: function(filename, params) {

    var self = this;
    var type = self.classify(filename);
    var isWikiPage = (type != null);

    //
    // definição base do renderizador
    //
    var instance = {
      send: function(req, res, next) {
        var file = getAbsolutePath(filename);
        res.sendFile(file);
      },
      view: function(req, res, next) {
        this.send(req, res, next);
      },
      edit: function(req, res, next) {
        this.send(req, res, next);
      },
      save: function() {
        this.redirect(settings.site.prefix + filename);
      }
    };

    //
    // redefinição das funções da classe
    //
    if (isWikiPage) {

      // view method
      switch (type) {
        case 'jade':
          instance.view = craftJadeRenderMethod(filename, type, params);
          break;
        case 'markdown':
        case 'textile':
          instance.view = craftWikiRenderMethod(filename, type, params);
          break;
      }

      // edit method
      instance.edit = craftEditRenderMethod(filename, type, params);

      // save method
      instance.save = craftSaveMethod(filename, type, params);

    }

    return instance;
  },

  classify: function(filename) {
    var extension = path.extname(filename);
    switch (extension) {

      case '.jade':
        return 'jade';

      case '.md':
      case '.markdown':
        return 'markdown';

      case '.htm':
      case '.html':
        return 'html';

      case '.textile':
        return 'textile';

      default:
        return null;
    }
  }

}

module.exports = renderer;
