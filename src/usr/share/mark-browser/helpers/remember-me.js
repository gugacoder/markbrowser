var randomString = require('../helpers/random-string');

var tokens = {};

function issueToken(user, done) {
  var token = randomString(64);
  saveRememberMeToken(token, user.username, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
};

function consumeRememberMeToken(token, fn) {
  var username = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  return fn(null, username);
};

function saveRememberMeToken(token, username, fn) {
  tokens[token] = username;
  return fn();
};

var rememberMe = {
  issueToken: issueToken,
  consumeRememberMeToken: consumeRememberMeToken,
  saveRememberMeToken: saveRememberMeToken
};

module.exports = rememberMe;
