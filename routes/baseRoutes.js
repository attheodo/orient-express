var express = require('express');
var router = express.Router();

var ctrl = require('../controllers/BaseCtrl.js');

router.get('/', ctrl.index);

module.exports = router;
