var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var multer  = require('multer');
var shortid = require('shortid');
var settings = require('../middlewares/settings');

var uploader = multer({
  dest: './uploads'
});

function getAbsolutePath(filename) {
  return path.normalize(path.join(settings.workdir, filename));
}

function ensureParents(file) {
  var dirname = path.dirname(file);
  mkdirp.sync(dirname);
}

function makeName(req) {
  var filepath = req.path;

  // definindo um nome unico para o arquivo.
  // `keys` pode ser definido no form com os nomes dos campos que devem formar
  // o nome único
  var uid = '';
  if (req.body['up.uid'] === undefined) {
    uid = shortid.generate();
  } else {
    var tokens = req.body['up.uid'].split(',');
    tokens.forEach(function(field) {
      var value = req.body[field].replace(/[^a-zA-Z0-9@._-]/g, '-');
      if (uid != '') uid += '.';
      uid += value;
    });
  }

  // o sufixo é adicionado logo após o identificador do arquivo, caso
  // tenha sido enviado junto com o formulario.
  var suffix = '';
  if (req.body['up.suffix'] !== undefined) {
    suffix = '.' + req.body['up.suffix'];
  }

  var filename = filepath;
  if (!filename.endsWith('/')) filename += '.';
  filename += uid + suffix;
  
  return filename;
}

router.post('*', uploader.any(), function(req, res, next) {
  try {
    var basename = makeName(req);

    // gravando um cabecalho...
    {
      var filename = basename + '.json';
      var filepath = getAbsolutePath(filename);
      ensureParents(filepath);
      var indentation = 2;
      var json = JSON.stringify(req.body, null, indentation);
      fs.writeFileSync(filepath, json);
    }

    // gravando os anexos...
    {
      req.files.forEach(function(fileinfo, index) {
        var filename = basename;

        var fieldname = fileinfo.fieldname
        if (fieldname != 'default') filename += '.' + fieldname;

        var extension = path.extname(fileinfo.originalname);
        filename += extension;

        var filepath = getAbsolutePath(filename);
        ensureParents(filepath);

        fs.renameSync(fileinfo.path, filepath);
      });
    }

    // renderizando página seguinte...
    if (req.body['up.fwd'] !== undefined || req.body['up.forward'] !== undefined) {
      res.redirect(req.body['up.fwd'] || req.body['up.forward']);
    } else {
      res.render('upload/success');
    }

  } catch(err) {
    next(err);
  }
});

module.exports = router;
