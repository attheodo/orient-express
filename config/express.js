var express = require('express');
var path = require('path');

var winston = require('winston');
var nconf = require('nconf');
var PrettyError = require('pretty-error');
var BPromise = require('bluebird');
var colors = require('colors');

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

if(process.env.NODE_ENV !== 'production'){
	console.log('\n[ORIENT-EXPRESS]'.bold.white + ' - Starting up the train...\n');
}

var setup = BPromise.method(function(){

	/* Load models */
	var tender = require('../helpers/tender')(app);

	return tender.init().then(function(data) {
		app.set('models', data.models);
		app.set('connections', data.connections);

		/* Setup routes */
		routes(app);

		/* Register error handlers */
		var errorHandlers = require('./errorHandlers.js')(app);
		app.use(errorHandlers.internalError);
		app.use(errorHandlers.routeNotFound);

	});

});


module.exports =  {
	app: app,
	setup: setup
};
