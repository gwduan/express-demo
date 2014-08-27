var settings = require('../settings');
var mongodb = require('mongodb');

var conn;
if (Array.isArray(settings.mongodb.servers)) {
  var servers = [];
  for (var i = 0; i < settings.mongodb.servers.length; i++) {
    servers.push(new mongodb.Server(settings.mongodb.servers[i].host,
                                    settings.mongodb.servers[i].port,
                                    settings.mongodb.servers[i].serverOptions));
  }
  var replSet = new mongodb.ReplSet(servers, settings.mongodb.rsOptions);
  conn = new mongodb.Db(settings.mongodb.name, replSet, {w: 1});
} else {
  var mongoServer = new mongodb.Server(settings.mongodb.host,
                                       settings.mongodb.port,
                                       settings.mongodb.serverOptions);
  conn = new mongodb.Db(settings.mongodb.name, mongoServer, {w: 1});
}

module.exports = conn;
