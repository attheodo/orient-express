/*
*   Diesel fuels Orient-Express with models functionality using
*   the Waterline ORM
*
*   https://github.com/balderdashy/waterline
*/

var path  = require('path');
var fs    = require('fs');

var Waterline = require('waterline');
var _ = require('lodash');
var Promise = require('bluebird');

Promise.promisifyAll(fs);

module.exports = function(app) {

    var globalConfig = app.get('nconf');
    var config = globalConfig.get('diesel');

    var v = config.verbose;

    var l = app.get('winston-logger');

    var adapters = {};

    function init() {
        return new Promise(function(resolve) {
            var modelsPath = path.resolve(path.dirname(require.main.filename) + config.modelsPath);

            var waterline = new Waterline();
            Promise.promisifyAll(waterline);

            if (v) {
                l.info('[Diesel] Searching for model definition files in "'+modelsPath.underline+'"...');
            }

            fs.readdirAsync(modelsPath).map(function(filename) {

                var adapterModule = null;
                var filePath = modelsPath + '/' + filename;

                if (path.extname(filename) !== '.js') {
                    return;
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
                    model.migrate = 'safe';
                }

                if(_.isUndefined(model.adapter) && _.isUndefined(config.waterline.connections[model.connection].adapter)) {
                    throw new Error('[Diesel] There\'s no default adapter for connection "'+model.connection+'", nor an explicitly configured adapter in "'+model.identity+'.js"');
                }
                // give priority to the explicitly set adapter in model configuration file
                else if (!_.isUndefined(model.adapter)) {

                    try {

                        adapterModule = require(model.adapter);
                        adapters[model.adapter] = adapterModule;

                    } catch(e) {
                        throw new Error('[Diesel] Connection adapter module "'+model.adapter+'" defined in "'+model.identity+'.js'+'" not found. Try \'npm install '+model.adapter+' --save\'');
                    }

                }
                // fallback to default adapter for connection
                else {
                    try {

                        var adapter = config.waterline.connections[model.connection].adapter;
                        adapterModule = require(adapter);
                        adapters[model.adapter] = adapterModule;

                    } catch(e) {
                        throw new Error('[Diesel] Default Connection adapter module "'+adapter+'" for connection "'+model.connection+'" not found. Try \'npm install '+adapter+' --save\'');
                    }
                }

                var collection = Waterline.Collection.extend(model);
                waterline.loadCollection(collection);

                if (v) {
                    l.info('  ✓'.green +'  Loaded model "'+model.identity.underline+'" with connection "'+model.adapter+':'+model.connection+'"');
                }

            }, {concurrency: 5}).then(function() {

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
                        };
                    }
                }

                return waterline.initializeAsync(config.waterline);
            }).then(function(data) {
                l.info('[Diesel] All models loaded');
                resolve({models: data.collections, connections: data.connections});
            }).catch(Error, function(err) {
                if (err.code === 'ENOENT') {
                    resolve({error: '[Diesel] Error reading model definition files: '+ err});
                } else {
                    resolve({error: err});
                }
            });
        });
    }

    return {
        init: init
    };
};
