'use strict';

const { User } = require('../../../models/user.model');
const moment = require('moment');
const select = { salt: 0, hashedPassword: 0, failedPasswordsAttempt: 0, isEmailVerified: 0, isActive: 0, isDeleted: 0 }

exports.create = function (userData) {
    return new Promise(function (resolve, reject) {
        User.create(userData, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        })

    })
}

exports.findById = function (userId) {
    return new Promise(function (resolve, reject) {
        User.findById(userId, select, function (err, user) {
            if (err) {
                reject(err);
            } else if (!user) {
                reject('User not found.');
            } else {
                resolve(user);
            }
        })

    })
}

const update = function (query, data, options) {
    return new Promise(function (resolve, reject) {
        User.update(query, data, options, function (err, result) {
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
        User.find(query, select, function (err, users) {
            if (err) {
                reject(err);
            } else {
                resolve(users);
            }
        })

    })
}

exports.findOne = function (query) {
    return new Promise(function (resolve, reject) {
        User.findOne(query, function (err, user) {
            if (err) {
                reject(err);
            } else {
                resolve(user);
            }
        })

    })
}

const findOneAndUpdate = function (query, data, options) {
    return new Promise(function (resolve, reject) {
        User.findOneAndUpdate(query, data, options, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })

    })
}

exports.findOneAndRemove = function (query) {
    return new Promise(function (resolve, reject) {
        User.findOneAndRemove(query, function (err, users) {
            if (err) {
                reject(err);
            } else {
                resolve(users);
            }
        })

    })
}

exports.passwordCheck = function ({password, user}) {
    return new Promise(function (resolve, reject) { 
        if (moment(user.failedPasswordsAttempt.blockedTill).isSameOrAfter(moment()) == true) {
            var errors = {
                success: false,
                status: 429,
                msg:
                    "Sorry! You can't login because you have exceeded your password attempts. Please try again later",
            };
            reject(errors)
            return;
        } else {
            if (!user.authenticate(password)) {
                if (user.failedPasswordsAttempt.count >= 5) {
                    findOneAndUpdate(
                        { _id: user._id },
                        {
                            "failedPasswordsAttempt.blockedTill": moment().add(30, "minutes"),
                        }
                    ).then(() => {
                        var errors = {
                            success: false,
                            status: 429,
                            msg: "You are blocked because you have exceeded your number of attempts. Please try again after 30 mins",
                        };
                        reject(errors);
                        return;
                    });
                } else {
                    findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                "failedPasswordsAttempt.count": user.failedPasswordsAttempt.count + 1,
                            },
                        }
                    ).then(() => {
                        reject({
                            success: false,
                            status: 401,
                            msg: 'This password is not correct.'
                        });
                        return;
                    });
                }
            } else {
                if (user.isEmailVerified == false) {
                    var errors = { success: false, status: 401, msg: "Please verify your email first" };
                    reject(errors);
                    return;
                } else if (user.isActive == false) {
                    var errors = {
                        success: false,
                        status: 401,
                        msg: "Your account has been suspended by admin",
                    };
                    reject(errors);
                    return;
                } else {
                    update(
                        { _id: user._id },
                        {
                            $set: {
                                "failedPasswordsAttempt.blockedTill": null,
                                "failedPasswordsAttempt.count": 0,
                                updatedDate: moment(),
                            },
                        }
                    ).then((raw) => {
                        resolve(user)
                        return;
                    });
                }
            }
        }
    })
}

exports.updateUserPassword = function(id, pass){
    return new Promise((resolve, reject)=>{
        User.findById(id, async function(err, user){
            user.password = pass
            await user.save(raw=>{
                resolve(raw)
            });
        })
    })
}

exports.findOneAndUpdate = findOneAndUpdate;
exports.update = update;