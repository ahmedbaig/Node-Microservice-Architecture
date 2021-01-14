"use strict";

const _ = require("lodash");
const moment = require("moment");
var path = require("path");
const bcrypt = require("bcryptjs");
const UserSerivce = require('../app/http/controllers/services/user.service')
const TokenService = require('../app/http/controllers/services/token.service')
const AuthSerivce = require('../app/http/controllers/services/auth.service')


const { UserData } = require("../app/models/user.model");
const { Token } = require("../app/models/token.user.model");
const {
    verify,
    createToken,
    generateOTP,
} = require("../app/http/controllers/services/auth.service");
const { sendUserVerifyEmail } = require("../app/http/controllers/mail");

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render(path.join(ROOTPATH, "views/views/pages/welcome.ejs"), { appId: process.env.PORT });
    });

    app.get("/verify-email/:token", async function (req, res) {
        AuthSerivce.verifyNewAccountToken(req.params.token, {
            errorCallback: (error) => {
                var errorBags = [{
                    message: error.msg,
                },];
                res.render(path.join(ROOTPATH, "views/views/error/bags.ejs"), { errorBags });
                return;
            },
            callback: (data) => {
                UserSerivce.findById(data.userId).then(user => {
                    if (data.token) { // User has an expired token 
                        if (user == null) {
                            var errorBags = [{
                                message: "User not found",
                            },];
                            res.render(path.join(ROOTPATH, "views/views/error/bags.ejs"), { errorBags });
                            return;
                        }
                        sendUserVerifyEmail({
                            token: data.token.token.token,
                            user
                        }).then(data => {
                            res.render(path.join(ROOTPATH, "views/views/pages/verify-email-resend.ejs"), {
                                email: user.email,
                            });
                            return;
                        }).catch(error => {
                            res.status(error.status).send(error);
                            return;
                        });
                    } else { // DONE 
                        UserSerivce.update({ _id: user._id }, { isEmailVerified: true })
                            .then(() => {
                                res.render(path.join(ROOTPATH, "views/views/pages/verify-email.ejs"), {
                                    email: user.email,
                                });
                            }).catch(error => {
                                var errorBags = [{
                                    message: error.msg,
                                },];
                                res.render(path.join(ROOTPATH, "views/views/error/bags.ejs"), { errorBags });
                                return;
                            })
                    }
                }).catch((error) => {
                    var errorBags = [{
                        message: error.msg,
                    },];
                    res.render(path.join(ROOTPATH, "views/views/error/bags.ejs"), { errorBags });
                    return;
                });
            }
        })
    });

    app.get("/reset-password/:token", function (req, res) {
        res.render(path.join(ROOTPATH, "views/views/pages/reset-password.ejs"), {
            query: req.query,
            errorBags: [],
            token: req.params.token,
        });
    });

    app.post("/reset-password/", async function (req, res) {
        if (req.body.pass != req.body.conf_pass) {
            res.redirect(
                `/reset-password/${req.body.token}?error=\"New Password\" and \"Confirm Password\" do not match!`
            );
            return
        }
        var regex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&^()-_+={}~|])[A-Za-z\d$@$!%*#?&^()-_+={}~|]{8,}$/);
        if (!regex.test(req.body.pass)) {
            res.redirect(
                `/reset-password/${req.body.token}?error=Password must be atleast eight characters long, containing atleast 1 number, 1 special character and 1 alphabet.`
            );
            return
        };
        if (!req.body.token) {
            res.redirect(
                `/reset-password/${req.body.token}?error=Unauthorized Request!`
            );
            return
        }
        TokenService.checkToken({ token: req.body.token })
            .then(data => { 
                verify(data.token, {
                    errorCallback: (error) => {
                        console.log(error)
                        res.redirect(`/500/?err=${error.msg}`);
                        return
                    },
                    callback: ({ success }) => {
                        if (success == true) {
                            try {
                                UserSerivce.updateUserPassword(data.userId._id, req.body.pass)
                                    .then(result => {
                                        res.redirect(
                                            `/reset-password/${req.body.token}?success=Password Resetted`
                                        );
                                        return
                                    })
                                    .catch(error => {
                                        res.redirect(
                                            `/reset-password/${req.body.token}?error=Something Went Wrong`
                                        );
                                        return
                                    });
                            } catch (error) {
                                console.log(error)
                                res.redirect(`/500/?err=${error.message}`);
                                return
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.log(error)
                res.redirect(`/500/?err=${error.msg}`);
                return
            })
    });

    app.get("/login", function (req, res) {
        res.render("views/views/pages/login.ejs");
    });

    app.get("/resources-images/:filename", function (req, res) {
        let filename = req.params.filename.replace(/\//g, '.')
        res.sendFile(
            path.join(ROOTPATH, "views/images", filename)
        );
    });

    app.get("/404", function (req, res) {
        res.render(path.join(ROOTPATH, "views/views/error/404.ejs"));
    });

    app.get("/500", function (req, res) {
        if (req.query.err == null || req.query.err == "") {
            req.query.err = "Misuse of resource";
        }
        res.render(path.join(ROOTPATH, "views/views/error/500.ejs"), { error: req.query.err });
    });

    app.get("/*", function (req, res) {
        res.render(path.join(ROOTPATH, "views/views/error/404.ejs"));
    });
};