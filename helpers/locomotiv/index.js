var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var setupRoute = require('./setupRoute');

/**
 * Locomotiv Entry point
 *
 * @param app An Express app instance
 * @param {Object} userOptions An object with configuration options

**/
module.exports = function(app, userOptions) {

    var l = app.get('winston-logger');

    var config = app.get('nconf');

    var options = config.get('locomotiv');
    options.processDir = process.cwd();

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

    jsonFiles.forEach(function (file){

        options.routeName           = file.split('.')[0];
        options.baseRoutesPath      = path.join(options.processDir, options.routesPath);
        options.baseControllerPath  = path.join(options.processDir, options.controllersPath);
        options.baseMiddlewarePath = path.join(options.processDir, options.middlewarePath);

        setupRoute(app, options);
    });


};
