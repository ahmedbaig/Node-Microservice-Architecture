"use strict";

const _ = require("lodash");
const moment = require("moment");
var path = require("path");
const bcrypt = require("bcryptjs");
const { UserData } = require("../app/models/user.model");
const { Token } = require("../app/models/token.user.model");
const {
    verify,
    createToken,
    generateOTP,
} = require("../app/http/controllers/services/auth.service");

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.render(path.join(ROOTPATH, "views/views/pages/welcome.ejs"), { appId: process.env.PORT });
    });

    app.get("/verify-email/:token", async function(req, res) {
        const alreadyExist = await Token.findOne({ token: req.params.token });
        if (alreadyExist == null) {
            //   Token does not exist
            var errorBags = [{
                message: "Token does not exist.",
            }, ];
            res.render(path.join(ROOTPATH, "views/views/error/bags.ejs"), { errorBags });
            return;
        } else {
            // Token exists
            const user = await UserData.findOne({ _id: alreadyExist.userId });
            if (user == null) {
                var errorBags = [{
                    message: "User not found",
                }, ];
                res.render(path.join(ROOTPATH, "views/views/error/bags.ejs"), { errorBags });
                return;
            }
            if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
                //   Already exists and has not expired yet
                await Token.findOneAndRemove({ token: alreadyExist.token }).then(
                    async() => {
                        await UserData.findOneAndUpdate({ _id: user._id, email: user.email }, { isEmailVerified: true },
                            async(err, result) => {
                                if (err) {
                                    res.redirect(`/500?err=${err}`);
                                    return;
                                }
                                res.render(path.join(ROOTPATH, "views/views/pages/verify-email.ejs"), {
                                    email: user.email,
                                });
                                return;
                            }
                        );
                    }
                );
            } else {
                // Already exists and has expired get new token
                var new_token = Buffer.from(generateOTP()).toString("base64");
                let email = user.email;
                let user = { _id: alreadyExist.userId };
                await Token.findOneAndRemove({ token: alreadyExist.token }).then(
                    async() => {
                        await createToken(user, new_token).then((data) => {
                            res.render(path.join(ROOTPATH, "views/views/pages/verify-email-resend.ejs"), {
                                email: email,
                            });
                            return;
                        });
                    }
                );
            }
        }
    });

    app.get("/reset-password/:token", function(req, res) {
        res.render(path.join(ROOTPATH, "views/views/pages/reset-password.ejs"), {
            query: req.query,
            errorBags: [],
            token: req.params.token,
        });
    });

    app.post("/reset-password/", async function(req, res) {
        if (req.body.pass != req.body.conf_pass) {
            res.redirect(
                `/reset-password/${req.body.token}?error=\"New Password\" and \"Confirm Password\" do not match!`
            );
            return
        }
        if (!req.body.token) {
            res.redirect(
                `/reset-password/${req.body.token}?error=Unauthorized Request!`
            );
            return
        }
        const alreadyExist = await Token.findOne({ token: req.body.token });
        if (alreadyExist == null) {
            //   Token does not exist
            res.redirect(
                `/reset-password/${req.body.token}?error=Unauthorized Request!`
            );
            return
        }

        let token = await Token.findOne({ token: req.body.token }).populate({
            path: "userId",
            model: "users",
        });
        await verify(req.body.token, res, async(success) => {
            if (success == true) {
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(req.body.pass, salt);
                    const result = await UserData.findOneAndUpdate({ _id: token.userId._id }, {
                        password: hashed,
                    });

                    if (result) {
                        res.redirect(
                            `/reset-password/${req.body.token}?success=Password Resetted`
                        );
                        return
                    } else {
                        res.redirect(
                            `/reset-password/${req.body.token}?error=Something Went Wrong`
                        );
                        return
                    }
                } catch (error) {
                    res.redirect(`/500/?err=${error.message}`);
                    return
                }
            }
        });
    });

    app.get("/login", function(req, res) {
        res.render("views/views/pages/login.ejs");
    });

    app.get("/resources-images/:filename", function(req, res) {
        let filename = req.params.filename.replace(/\//g, '.')
        res.sendFile(
            path.join(ROOTPATH, "views/images", filename)
        );
    });

    app.get("/404", function(req, res) {
        res.render(path.join(ROOTPATH, "views/views/error/404.ejs"));
    });

    app.get("/500", function(req, res) {
        if (req.query.err == null || req.query.err == "") {
            req.query.err = "Misuse of resource";
        }
        res.render(path.join(ROOTPATH, "views/views/error/500.ejs"), { error: req.query.err });
    });

    app.get("/*", function(req, res) {
        res.render(path.join(ROOTPATH, "views/views/error/404.ejs"));
    });
};