module.exports = function(app) {

    var l = app.get('winston-logger');

    return {

        routeNotFound: function (req, res, next) {

            res.status(404)

            if (process.env.NODE_ENV === 'development') {
                l.error('404 - Route not found:', req.url);
            }

            if (req.accepts('html')){

                res.render('errors/404', { url: req.url });

            } else if (req.accepts('json')) {

                res.json({ error: 'Route not found', status: 404, uri: req.url });
            }

        },

        internalError: function (err, req, res, next) {

            var statusCode = err.status || 500;
            var errorDetails = ''

            res.status(statusCode);

            if (process.env.NODE_ENV === 'development') {

                errorDetails = err.stack;
                l.error(statusCode + err.stack);

            }

            if (req.accepts('html')) {

                res.render('errors/500', { url: req.url });

            } else if (req.accepts('json')) {

                res.json({ url: req.url });

            }

        }

    }

}
