'use strict';

var express = require('express');
var auth = require('../../../../middleware/auth'); 
var controller = require('./course.admin.controller')
var router = express.Router();

router.get('/get', auth.isAuthenticated(), controller.get)

router.get('/get/:id', auth.isAuthenticated(), controller.getById)

router.put('/update/:id', auth.isAuthenticated(), controller.updateUser)

router.delete('/delete/:id', auth.isAuthenticated(), controller.deleteUser)

module.exports = router;