var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var password = 'die hard or keep trying...';

var crypter = {
  encrypt: function(text) {
    if (text.startsWith('enc:')) {
      // já está encriptado
      return text;
    }

    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');

    return 'enc:' + crypted;
  },

  decrypt: function(text) {
    if (!text.startsWith('enc:')) {
      // já está decriptado
      return text;
    }

    text = text.substring(4);

    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');

    return dec;
  },

  encryptPasswords: function(json) {
    var self = this;
    self.forEachPassword(json, function (password) {
      return self.encrypt(password);
    });
  },

  decryptPasswords: function(json) {
    var self = this;
    self.forEachPassword(json, function (password) {
      return self.decrypt(password);
    });
  },

  // Encripta ou decripta as senhas eoncontradas.
  // O método recebe a senha e deve retornar um texto processado.
  // O texto é armazenado no lugar da senha original.
  forEachPassword: function(json, encriptionMethod) {

    // /conf/users.json
    var users = json.users;
    if (users) {
      users.forEach(function(user) {
        if (user.password) {
          user.password = encriptionMethod(user.password);
        }
      });
    }

    // /conf/site.json
    var site = json.site ? json.site : json;
    if (site.auth
      && site.auth.ldapSettings
      && site.auth.ldapSettings.password
    ){
      site.auth.ldapSettings.password =
        encriptionMethod(site.auth.ldapSettings.password);
    }

  }
}

module.exports = crypter;
