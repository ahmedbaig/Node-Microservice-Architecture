'use strict';

var express = require('express');
var auth = require('../../../middleware/auth'); 
var controller = require('./course.controller')
var router = express.Router();

router.get('/get', controller.get)

module.exports = router;