'use strict';

const { Token } = require('../../../models/token.user.model');

exports.create = function (userData) {
    return new Promise(function (resolve, reject) {
        Token.create(userData, function (err, token) {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        })

    })
}

exports.findById = function (userId) {
    return new Promise(function (resolve, reject) {
        Token.findById(userId, function (err, token) {
            if (err) {
                reject(err);
            } else if (!user) {
                reject('Token not found.');
            } else {
                resolve(token);
            }
        })

    })
}

exports.update = function (query, data, options) {
    return new Promise(function (resolve, reject) {
        Token.update(query, data, options, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })

    })
}

exports.find = function (query) {
    return new Promise(function (resolve, reject) {
        Token.find(query, function (err, tokens) {
            if (err) {
                reject(err);
            } else {
                resolve(tokens);
            }
        })

    })
}

exports.findOne = function (query) {
    return new Promise(function (resolve, reject) {
        Token.findOne(query, function (err, token) {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        })

    })
}

exports.findOneAndRemove = function (query) {
    return new Promise(function (resolve, reject) {
        Token.findOneAndRemove(query, function (err, raw) {
            if (err) {
                reject(err);
            } else {
                resolve(raw);
            }
        })

    })
}

exports.checkToken = function(token){
    return new Promise(function(resolve, reject){  
        Token.findOne(token)
        .populate({path: "userId", model: "users"})
        .exec((err,alreadyExist)=>{   
            if (!alreadyExist) {
                //   Token does not exist 
                reject({msg: "Token not found!"}) 
                return
            }else{
                resolve(alreadyExist);
                return;
            }
        }) 
    })
}