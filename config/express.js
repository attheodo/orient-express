var express = require('express');
var path = require('path');

var winston = require('winston');
var nconf = require('nconf');
var PrettyError = require('pretty-error');
var Promise = require('bluebird');

var app = express();

var routes = require('../helpers/locomotiv');

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
var pe = new PrettyError();
pe.start();
pe.skipNodeFiles();
pe.skipPackage('express');

/* Register error handlers */
var errorHandlers = require('./errorHandlers.js')(app);
app.use(errorHandlers.internalError);
app.use(errorHandlers.routeNotFound);

function setup() {
	return new Promise(function(resolve) {
		/* Load models */
		var diesel = require('../helpers/diesel')(app);

		diesel.init().then(function(data) {
			if (data.error) {
				winston.loggers.get('express').error(data.error);
				process.exit(-1);
			} else {
				app.set('models', data.models);
				app.set('connections', data.connections);
			}

			/* Setup routes */
			routes(app);

			/* to-do: bootstrap */
			//call bootstrap helper

			resolve();
		});
	});
}

module.exports =  {
	app: app,
	setup: setup
};
