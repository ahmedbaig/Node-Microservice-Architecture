"use strict";
var compose = require("composable-middleware");
const _ = require("lodash");
const moment = require("moment");
var redisClient = require("redis").createClient;
let client;

exports.connect_cache = function() {
    return new Promise((resolve, reject) => {
        // client = redisClient({
        //     port: process.env.REDIS_PORT, // replace with your port
        //     host: process.env.REDIS_HOST, // replace with your hostanme or IP address
        //     password: process.env.REDIS_PASS, // replace with your password
        // });
        client = redisClient();
        client.on("error", function(err) {
            reject(err);
        });
        client.on("connect", function() {
            resolve();
        });
    });
};

function cache() {
    return (
        compose()
        // Attach user to request
        .use(function(req, res, next) {
            client.get(req.url, (err, data) => {
                if (err) throw err;
                if (data !== null) {
                    client.get(`count|${req.url}`, (err, data) => {
                        client.set(`count|${req.url}`, parseInt(data) + 1);
                    });
                    res.json(JSON.parse(data));
                } else {
                    next();
                }
            });
        })
    );
}

function setCache(req, res, data) {
    return new Promise((resolve, reject) => {
        console.log("Setting data", req.url);
        client.setex(req.url, 3600, JSON.stringify(data));
        client.setex(`count|${req.url}`, 3600, 1);
        client.setex(`count|${req.url}|${moment()}`, 3600, 1);
        resolve(data);
    });
}

exports.cache = cache;
exports.setCache = setCache;

exports.setUserStateToken = function(auth, exp) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Setting data (Auth Token). Expires In: ", exp, "Seconds");
            client.setex(`${auth}/state/token/expiry`, exp, JSON.stringify(auth));
            resolve(true);
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.deleteUserStateToken = function(auth) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Deleting data (Auth Token).");
            client.del(`${auth}/state/token/expiry`, function(err, response) {
                if (response == 1) {
                    resolve(true);
                } else {
                    reject({ success: false, message: err.message });
                }
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.getUserStateToken = function(auth) {
    return new Promise((resolve, reject) => {
        try {
            client.get(`${auth}/state/token/expiry`, (err, data) => {
                if (err) throw err;
                if (data !== null) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};


exports.getRedisKeys = async function(req, res) {
    return new Promise((resolve, reject) => {
        try {
            client.keys("*", function(err, keys) {
                let count = _.filter(keys, function(o) {
                    return o.split("|")[0] == "count";
                });
                if (err) reject({ success: false, message: err });
                resolve({ count });
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.getRedisKey = function(req, res) {
    return new Promise((resolve, reject) => {
        try {
            client.get(req.body.key, (err, data) => {
                if (err) reject({ success: false, message: err });
                resolve(data);
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.deleteRedisKey = async function(req, res) {
    return new Promise((resolve, reject) => {
        try {
            client.del(req.body.key, function(err, response) {
                client.keys("*", function(err, keys) {
                    if (err) reject({ success: false, message: err });
                    if (response == 1) {
                        resolve({ keys, message: "Key Deleted", success: true });
                    } else {
                        reject({ keys, message: "Cannot Delete Key", success: false });
                    }
                });
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.deleteRedisKeys = async function(req, res) {
    return new Promise((resolve, reject) => {
        try {
            client.flushdb(function(err, succeeded) {
                if (err) reject({ success: false, message: err });
                resolve({ message: "Keys Deleted", success: true });
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.searchRedisKeys = async(req, res) => {
    return new Promise((resolve, reject) => {
        try {
            let key = "*" + req.query.key + "*";
            client.keys(key, function(err, keys) {
                // let count = _.filter(keys, function(o){ return o.split("|")[0] == 'count'})
                if (err) reject({ success: false, message: err });
                resolve({ keys });
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};

exports.searchAndDeleteKeys = async(keyword) => {
    return new Promise((resolve, reject) => {
        try {
            let key = "*" + keyword + "*";

            client.keys(key, function(err, keys) {
                keys.forEach((k) => {
                    client.del(k, function(err, response) {
                        console.log(`${key} keys deleted`);
                        resolve(true);
                    });
                });
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
};