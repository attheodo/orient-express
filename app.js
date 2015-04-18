var express = require('./config/express.js');

var app = express.app;

var log = app.get('winston-logger');
var config = app.get('nconf');

express.setup().then(function() {
    var server = app.listen(config.get('server:port'), function () {
      log.info('Listening at http://%s:%s', server.address().address, server.address().port);
    });
});
