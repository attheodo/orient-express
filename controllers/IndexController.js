/* jshint latedef: false */
module.exports = {
    index: indexHandler
};

function indexHandler(req, res) {
    res.render('index');
}
