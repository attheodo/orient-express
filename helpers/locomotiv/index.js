var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var colors = require('colors');

var setupRoute = require('./setupRoute');

/**
 * Locomotiv Entry point
 *
 * @param app An Express app instance
 * @param {Object} userOptions An object with configuration options

**/
module.exports = function(app, userOptions) {

    var l = app.get('winston-logger');

    // default options
    var options = {
        routesPath      : './routes',
        controllersPath : './controllers',
        middlewarePath : './middlewares',
        processDir      : process.cwd(),
        defaultAction   : 'index',
        verbose         : true

    };

    // Check if the user has passed custom options
    // and if yes, merge them with default options
    if (!_.isUndefined(userOptions)) {
        userOptions = {};
    }

    _.extend(options, userOptions);

    // load route declarations files
    var files = fs.readdirSync(options.routesPath);
    var jsonFiles = _.filter(files, function(f) {
        return path.extname(f) === '.json';
    });

    if(options.verbose) {
        l.info('[Locomotiv] Assembling wagons...');
    }

    jsonFiles.forEach(function (file){

        options.routeName           = file.split('.')[0];
        options.baseRoutesPath      = path.join(options.processDir, options.routesPath);
        options.baseControllerPath  = path.join(options.processDir, options.controllersPath);
        options.baseMiddlewarePath = path.join(options.processDir, options.middlewarePath);

        setupRoute(app, options);
    });

    if(options.verbose) {
        l.info('[Locomotiv] Wagons attached.\n');
    }


};
