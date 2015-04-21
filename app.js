var express = require('./config/express.js');

var app = express.app;

var log = app.get('winston-logger');
var config = app.get('nconf');

var bootstrap = require('./config/bootstrap.js')(app);

express
.setup()
.then(bootstrap)
.then(function() {
    var server = app.listen(config.get('server:port'), function () {
      console.log('\ninfo:'.green +' [Orient] Listening at http://%s:%s', server.address().address, server.address().port);
    });
});
