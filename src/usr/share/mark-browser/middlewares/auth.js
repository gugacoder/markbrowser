var settings = require('../middlewares/settings.js');
var rememberMe = require('../helpers/remember-me');
var auth = require('basic-auth');
var url = require('url');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;

var useLdap = settings.site.auth ? settings.site.auth.ldap : false;
var authTypes = useLdap ? [ 'ActiveDirectory', 'local' ] : 'local';

function findUser(username) {
  var users = settings.users;
  var cases = users.filter(function (e) {
    return e.username == username;
  });
  return cases.length ? cases[0] : null;
}

if (useLdap) {
  var ActiveDirectoryStrategy = require('passport-activedirectory');
  passport.use(new ActiveDirectoryStrategy({
    integrated: false,
    ldap: settings.site.auth.ldapSettings
  }, function (profile, ad, done) {
    ad.isUserMemberOf(profile._json.dn, 'AccessGroup', function (err, isMember) {
      //if (err) return done(err)
      if (err) return done(null, false);
      return done(null, profile);
    })
  }));
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    try {
      var user = findUser(username);
      if (user && (user.password == password)){
        return done(null, user);
      }

      return done(null, false, 'Usuário e senha não conferem.');

    } catch(err) {
      return done(err);
    }
  }
));

passport.use(new RememberMeStrategy(
  function(token, done) {
    rememberMe.consumeRememberMeToken(token, function(err, username) {
      if (err) { return done(err); }
      if (!username) { return done(null, false); }

      var user = findUser(username);
      if (!user) { return done(null, false); }
      return done(null, user);

    });
  },
  rememberMe.issueToken
));

// serialização do usuário com suporte a LDAP
passport.serializeUser(function(user, done) {

  var ldapUser = user._json;
  var isLdapUser = Boolean(ldapUser);

  if (isLdapUser) {
    var username = ldapUser.sAMAccountName;

    var user = findUser(username);
    if (!user) {
      user = { username: username };
    }

    user.name = ldapUser.displayName;
    if (!user.role) {
      // Todos os usuários logados no AD são editores.
      user.role = 'editor';
    }
    if (!user.homepage) {
      user.homepage = settings.site.prefix + '/users/' + username + '-homepage.md';
    }
  }

  user.isLdapUser = isLdapUser;

  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Instância do autenticador e autorizador de usuários.
//
var auth = {
  validate: function() {
    return passport.authenticate(authTypes, {
      failureRedirect: settings.site.prefix + '/users/login',
      failureFlash: true
    });
  },
  invalidate: function() {
    return function(req, res, next) {
      req.logout();
      next();
    };
  },
  authorize: function(role) {
    var self = this;
    return function(req, res, next) {
      if (self.isInRole(role, req.user))
        next();
      else
        res.render('forbidden');
    };
  },
  deny: function() {
    return function(req, res, next) {
      res.render('forbidden');
    };
  },
  canEditPage: function(user) {
    if (user === undefined) return false;
    return (user.role == 'editor') || (user.role == 'admin');
  },
  isInRole: function(role, user) {
    switch (role) {
      case 'admin':
        return user && (user.role == 'admin');
      case 'editor':
        return user && (user.role == 'admin' || user.role == 'editor');
      case 'user':
        return user && (user.role == 'admin' || user.role == 'editor' || user.role == 'user');
      default:
        return true;
    }
  }
};

module.exports = auth;
