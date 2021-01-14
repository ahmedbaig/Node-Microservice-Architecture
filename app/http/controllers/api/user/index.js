'use strict';

"use strict";
var express = require('express');
var auth = require('../../../middleware/auth'); 
var controller = require('./user.controller')
var router = express.Router();

router.post('/register', controller.register)

router.post('/login', controller.login)

router.post('/logout', auth.isAuthenticated(), controller.logout)

router.post('/forgot-password', controller.forgotPassword)

router.get('/get', auth.isAuthenticated(), controller.get)

router.put('/update', auth.isAuthenticated(), controller.update)

router.delete('/delete', auth.isAuthenticated(), controller.delete)

module.exports = router;