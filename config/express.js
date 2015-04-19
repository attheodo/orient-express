var express = require('express');
var path = require('path');

var winston = require('winston');
var nconf = require('nconf');
var PrettyError = require('pretty-error');
var BPromise = require('bluebird');

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

function setup() {

	return new BPromise(function(resolve) {
		/* Load models */
		var tender = require('../helpers/tender')(app);

		tender.init().then(function(data) {
			app.set('models', data.models);
			app.set('connections', data.connections);

			/* Setup routes */
			routes(app);

			/* Register error handlers */
			var errorHandlers = require('./errorHandlers.js')(app);
			app.use(errorHandlers.internalError);
			app.use(errorHandlers.routeNotFound);

			resolve();
		}).catch(function(err) {
			winston.loggers.get('express').error(err);
			process.exit(-1);
		});
	});
}

module.exports =  {
	app: app,
	setup: setup
};
