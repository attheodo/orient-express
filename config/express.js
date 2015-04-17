/* jshint global hbs, pe */
var express = require('express');
var path = require('path');

var hbs = require('hbs');
var winston = require('winston');
var nconf = require('nconf');
var PrettyError = require('pretty-error');

var app = express();

var routes = require('../helpers/locomotiv/locomotiv.js');


/* Load configuration files */
nconf.argv().env()
	.file({ file: path.join(__dirname, 'env/' + process.env.NODE_ENV + '.json') })
	.file({ file: path.join(__dirname, 'env/local.json') });

app.set('nconf', nconf);

/* Configure Winston logger */
var winstonConfig = nconf.get('logging');

Object.keys(winstonConfig).forEach(function(key) {
    winston.loggers.add(key, winstonConfig[key]);
});

app.set('winston-logger', winston.loggers.get('express'));

/* Configure view engine and view containting directory */
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

/* Configure pretty-error */
pe = new PrettyError().start();
pe.skipNodeFiles();
pe.skipPackage('express');

/* Setup routes */
routes(app);

/* Register error handlers */
var errorHandlers = require('./errorHandlers.js')(app);
app.use(errorHandlers.internalError);
app.use(errorHandlers.routeNotFound);


module.exports = app;
