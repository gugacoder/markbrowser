var path = require('path');
var hyphenize = require('hyphenize');
var program = require('commander');
var crypter = require('../helpers/crypter.js');
var commandLineArgs = require('command-line-args');

var optionDefinitions = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 8000 },
  { name: 'prefix', type: String, defaultValue: null },
  { name: 'workdir', alias: 'w', type: String, defaultValue: process.cwd() },
];
var options = commandLineArgs(optionDefinitions);

var workdir = path.resolve(options.workdir);
var prefix = (options.prefix && options.prefix.length) ? options.prefix : null;

var settings = {
  site: {},
  users: [],
  workdir: workdir,
  refresh: function() {
    var self = this;
    var sitepath = path.join(workdir, 'conf/site.json');
    var userpath = path.join(workdir, 'conf/users.json');

    delete require.cache[require.resolve(sitepath)];
    delete require.cache[require.resolve(userpath)]

    settings.site = require(sitepath);
    settings.users = require(userpath).users;

    if (!settings.site.name) {
      settings.site.name = hyphenize(settings.site.title);
    }

    if (!prefix) {
      prefix =
        (settings.site.prefix && settings.site.prefix.length)
          ? settings.site.prefix : '';
    }
    if (prefix.length && !prefix.startsWith('/')) {
      prefix = '/' + prefix;
    }
    settings.site.prefix = prefix;

    self.sanitize();

    crypter.decryptPasswords(settings);
  },
  /*
   * sanitizações, correções e aplicações de valores default...
   */
  sanitize: function() {
    var self = this;

    if (self.site.spaces) {
      self.site.spaces.forEach(function(space) {
        if (space.homepage === undefined) {
          space.homepage = path.join('/', space.name, 'index.md');
        } else if (!path.isAbsolute(space.homepage)) {
          space.homepage = path.join('/', space.name, space.homepage);
        }
      });
    }

  }
}

settings.refresh();

module.exports = settings;
