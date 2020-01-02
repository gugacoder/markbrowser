var settings = require('../middlewares/settings.js');

var session = {
  globals: function(req, res, next) {
    try {
      settings.refresh();

      res.locals.site = settings.site;
      res.locals.resource = req.path;

      next();
    } catch(err) {
      next(err);
    }
  },
  locals: function(req, res, next) {
    try {

      res.locals.error = req.flash('error');
      res.locals.user = req.user;

      next();
    } catch(err) {
      next(err);
    }
  }
}

module.exports = session;
