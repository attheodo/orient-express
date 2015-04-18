/*
*   Diesel fuels Orient-Express with models functionality using
*   the Waterline ORM
*
*   https://github.com/balderdashy/waterline
*/

var async = require('async');
var path  = require('path');
var fs    = require('fs');

var Waterline = require('waterline');
var _ = require('lodash');
var colors = require('colors');


module.exports = function(app) {

    var globalConfig = app.get('nconf');
    var config = globalConfig.get('diesel');

    var v = config.verbose;

    var l = app.get('winston-logger');

    var models = null;
    var connections = null;

    var adapters = {};

    function init(cb) {

        var modelsPath = path.resolve(path.dirname(require.main.filename) + config.modelsPath);

        var waterline = new Waterline();

        fs.readdir(modelsPath, function(err, files){

            if (err) {
                return cb('[Diesel] Error reading model definition files: '+ err);
            }

            if(v) {
                l.info('[Diesel] Searching for model definition files in "'+modelsPath.underline+'"...');
            }

            async.each(files, function(filename, callback) {

                var adapterModule = null;
                var filePath = modelsPath + '/' + filename;

                if(path.extname(filename) !== '.js') {
                    return callback();
                }

                var model = require(filePath);

                if(!_.isString(model.identity)) {
                    model.identity = filename.split('.')[0];
                }

                if(!_.isString(model.connection)) {
                    model.connection = 'defaultDatabase';
                }

                // don't touch models if we're on production
                if(!_.isUndefined(model.migrate) && process.env.NODE_ENV === 'production') {
                    model.migrate = "safe";
                }

                if(_.isUndefined(model.adapter) && _.isUndefined(config.waterline.connections[model.connection].adapter)) {
                    return cb('[Diesel] There\'s no default adapter for connection "'+model.connection+'", nor an explicitly configured adapter in "'+model.identity+'.js"');
                }
                // give priority to the explicitly set adapter in model configuration file
                else if (!_.isUndefined(model.adapter)) {

                    try {

                        adapterModule = require(model.adapter);
                        adapters[model.adapter] = adapterModule;

                    } catch(e) {
                        return cb('[Diesel] Connection adapter module "'+model.adapter+'" defined in "'+model.identity+'.js'+'" not found. Try \'npm install '+model.adapter+'-- save\'');
                    }

                }
                // fallback to default adapter for connection
                else {
                    try {

                        var adapter = config.waterline.connections[model.connection].adapter;
                        adapterModule = require(adapter);
                        adapters[model.adapter] = adapterModule;

                    } catch(e) {
                        return cb('[Diesel] Default Connection adapter module "'+adapter+'" for connection "'+model.connection+'" not found. Try \'npm install '+adapter+'-- save\'');
                    }
                }

                var collection = Waterline.Collection.extend(model);
                waterline.loadCollection(collection);

                if (v) {
                    l.info('  ✓  Loaded model "'+model.identity.underline+'" with connection "'+model.adapter+':'+model.connection+'"');
                }

                callback();

            }, function(err) {

                if (err) {
                    return cb('[Diesel] Error loading model:' + err);
                }

                config.waterline.adapters = adapters;

                if(_.isUndefined(config.migrate)) {
                    l.warn('[Diesel] It appears you\'ve not set a model migration setting in your global configuration file. Assuming "migrate": "safe".');
                    config.migrate = 'safe';
                } else {

                    // don't let waterline mess with the models in any way if we're on production!
                    if(process.env.NODE_DEV === 'production') {
                        config.migrate = 'safe';
                    } else {
                        config.waterline.defaults = {
                            migrate: config.migrate
                        }
                    }
                }

                waterline.initialize(config.waterline, function(err, data){

                    if(err) {
                        return cb(err);
                    }

                    models = data.collections;
                    connections = data.connections;

                    l.info('[Diesel] All models loaded');

                    return cb();
                })

            });

        });
    }

    return {
        models: models,
        connections: connections,
        init: init
    }
}
