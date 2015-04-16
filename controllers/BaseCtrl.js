module.exports = {
    index: indexHandler
}

function indexHandler(req, res, next) {
    winston.info("skata");
    res.send(200);
}
