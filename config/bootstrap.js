var BPromise = require('bluebird');

module.exports = function(app) {

    return function() {

            return new BPromise(function(resolve, reject){
                resolve();
            });
    };

};
