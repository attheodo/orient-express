module.exports = {
    index: indexHandler
}

function indexHandler(req, res, next) {
    res.sendStatus(200);
}
