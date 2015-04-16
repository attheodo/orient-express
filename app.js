var app = require('./config/express.js');

var log = app.get('winston-logger');
var config = app.get('nconf');

var server = app.listen(config.get('server:port'), function () {

  log.info('Listening at http://%s:%s', server.address().address, server.address().port);

});
