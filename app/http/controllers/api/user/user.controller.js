"use strict";
const _ = require('lodash');
const moment = require('moment');

moment.fn.fromNow_seconds = function (a) {
    var duration = moment(this).diff(moment(), 'seconds');
    return duration;
}

const { validateRegisterData, validateLoginData } = require("../../Validate");
const UserService = require('../../services/user.service');
const { token, generateAuthToken } = require("../../services/auth.service");
const { sendUserVerifyEmail,sendForgotPasswordEmail } = require("../../mail");
const { setUserStateToken, deleteUserStateToken } = require('../../../../cache/redis.service');
exports.register = async function (req, res) {
    try {
        const { error } = validateRegisterData(req.body);
        if (error) {
            var errors = {
                success: false,
                msg: error.details[0].message,
                data: error.name,
            };
            res.status(400).send(errors);
            return;
        }
        UserService.create(req.body).then(user => {
            token(user, {
                errorCallback: (error) => {
                    res.status(error.status).send(error);
                    return;
                },
                callback: ({ token: { token: token } }) => {
                    // SEND USER VERIFICATION EMAIL
                    sendUserVerifyEmail({
                        token,
                        user
                    }).then(data => {
                        res.status(200).send(data);
                        return;
                    }).catch(error => {
                        res.status(error.status).send(error);
                        return;
                    });
                }
            });
        }).catch((error) => {
            if (error.errors && error.errors.email && error.errors.email.message == 'The specified email address is already in use.') {
                res.status(400).send({ msg: 'The specified email address is already in use.', success: false })
            } else if (error.errors && error.errors.email && error.errors.email.message == "Path `email` is required.") {
                res.status(400).send({ msg: 'Email is required', success: false })
            } else if (error.message == 'Invalid password') {
                res.status(400).send({ msg: 'Invalid password', success: false })
            } else {
                res.status(400).send({ success: false, msg: error.message });
            }
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};
exports.login = async function (req, res) {
    try {
        const { error } = validateLoginData(req.body);
        if (error) {
            var errors = {
                success: false,
                msg: error.details[0].message,
                data: error.name,
            };
            res.status(400).send(errors);
            return;
        }
        let { email, password, type } = req.body;

        UserService.findOne({
            email,
            isDeleted: false,
        }).then(user => {
            if (!user) {
                var errors = {
                    success: false,
                    msg: "No user with this account exists!",
                };
                res.status(200).send(errors);
                return;
            }
            if (user.type != type) {
                var errors = {
                    success: false,
                    msg: "User type provided does not match",
                };
                res.status(400).send(errors);
                return;
            }
            UserService.passwordCheck({ user, password })
                .then(() => {
                    generateAuthToken(user._id, (token) => {
                        setUserStateToken(token, moment(moment().add(48, 'hours')).fromNow_seconds())
                            .then(
                                (success) => {
                                    user = _.pick(user, [
                                        "_id",
                                        "userName",
                                        "type",
                                        "profile_img",
                                        "email",
                                        "phoneNo",
                                        "firstName",
                                        "lastName",
                                    ]);
                                    var success = { success: true, msg: "Logged in successfully", user, access_token: token };
                                    res.status(200).send(success);
                                    return;
                                }
                            )
                            .catch((error) => {
                                res.status(500).send({ success: false, msg: error.message });
                                return;
                            });
                    })
                }).catch(errors => {
                    res.status(errors.status).send({ success: false, message: errors.msg });
                    return;
                })
        }).catch(error => {
            res.status(500).send({ success: false, msg: error.message });
        });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};
exports.logout = async function (req, res) {
    try {
        deleteUserStateToken(req.auth)
            .then(success => {
                if (success) {
                    res.send({ message: "Logged out!", success: true })
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: err });
            })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}
exports.forgotPassword = async function (req, res) {
    try {
        if (!req.body.email) {
            res.status(400).send({
                status: 400, msg: "No email provided", success: false
            })
            return;
        }
        UserService.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    res
                        .status(200)
                        .send({ success: false, msg: "No account with this email exists." });
                } else if (user) {
                    try {
                        token(user, {
                            errorCallback: (error) => {
                                res.status(error.status).send(error);
                                return;
                            },
                            callback: ({ token: { token: token } }) => {
                                // SEND USER FORGOT PASS EMAIL
                                sendForgotPasswordEmail({
                                    token,
                                    user
                                }).then(data => {
                                    res.status(200).send(data);
                                    return;
                                }).catch(error => {
                                    res.status(error.status).send(error);
                                    return;
                                });
                            }
                        });
                    } catch (err) {
                        var errr = {
                            success: false,
                            msg: "There was an error processing your request.",
                        };
                        res.status(422).send(errr);
                        return;
                    }
                }
            });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}
exports.get = async function (req, res) {
    try {
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};
exports.update = async function (req, res) {
    try {
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};
exports.delete = async function (req, res) {
    try {

    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};