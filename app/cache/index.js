'use strict';

var express = require('express');
var auth = require('../http/middleware/auth');
var role = require('../http/middleware/role');
var controller = require('./cache.controller')
var router = express.Router();

// router.post('/set-state', auth.isAuthenticated(), service.setUserState)

// router.get('/get-state', auth.isAuthenticated(), service.getUserState)

// router.get('/get-redis-keys', auth.isAuthenticated(), role.checkAdmin(), controller.getRedisKeys)

// router.post('/get-redis-key', auth.isAuthenticated(), role.checkAdmin(), controller.getRedisKey)

// router.post('/delete-redis-key', auth.isAuthenticated(), role.checkAdmin(), controller.deleteRedisKey)

// router.post('/delete-redis-keys', auth.isAuthenticated(), role.checkAdmin(), controller.deleteRedisKeys)

// router.get('/search-redis-keys',  controller.searchRedisKeys)

module.exports = router;