var settings = require('../settings');
var redis = require('redis');

var client = redis.createClient(settings.cache.port, settings.cache.host);

if (settings.cache.pass) {
  client.auth(settings.cache.pass, function(err) {
    if (err) {
      console.log('Redis Auth ' + err);
    }
  });
}

client.on('error', function(err) {
  console.log('Redis Error ' + err);
});

module.exports = client;

