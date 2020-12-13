'use strict';

var express = require('express');
var auth = require('../../../middleware/auth');
var role = require('../../../middleware/role');
// var controller = require('./cache.controller')
var router = express.Router();

// router.post('/set-state', auth.isAuthenticated(), service.setUserState)

module.exports = router;