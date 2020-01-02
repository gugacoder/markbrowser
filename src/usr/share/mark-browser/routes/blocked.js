var express = require('express');
var auth = require('../middlewares/auth');

var router = express.Router();
router.all('*', auth.deny());

module.exports = router;
