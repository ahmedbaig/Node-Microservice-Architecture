"use strict";
const jwt = require("jsonwebtoken");
var compose = require("composable-middleware");
const fs = require("fs");
var publicKEY = fs.readFileSync("config/cert/public.key", "utf8");
const moment = require("moment");

moment.fn.fromNow_seconds = function (a) {
    var duration = moment(this).diff(moment(), 'seconds');
    return duration;
}

const UserService = require("../controllers/services/user.service")
var { getUserStateToken, setUserStateToken } = require('../../cache/redis.service')

function isAuthenticated() {
    return (
        compose()
            // Attach user to request
            .use(function (req, res, next) {
                let token = req.headers['x-access-token'] || req.headers['authorization'];
                // Remove Bearer from string
                token = token.replace(/^Bearer\s+/, "");

                if (!token)
                    return res.status(401).send({
                        success: false,
                        msg: "Access Denied. No token provided.",
                        code: 401,
                    });

                try {
                    var i = process.env.ISSUER_NAME;
                    var s = process.env.SIGNED_BY_EMAIL;
                    var a = process.env.AUDIENCE_SITE;
                    var verifyOptions = {
                        issuer: i,
                        subject: s,
                        audience: a,
                        expiresIn: "12h",
                        algorithm: ["RS256"],
                    };
                    let JWTSPLIT = token.split(".");
                    var decodedJWTHeader = JSON.parse(
                        Buffer.from(JWTSPLIT[0], "base64").toString()
                    );
                    if (decodedJWTHeader.alg != "RS256") {
                        res.send({
                            success: false,
                            msg: "Access Denied. Compromised Authorized Token.",
                            status: 401,
                        });
                        return;
                    }
                    var decoded = jwt.verify(token, publicKEY, verifyOptions);
                    if (moment(decoded.expiresIn).isSameOrAfter(moment()) == true) {
                        req.user = decoded;
                        req.auth = token;
                        next();
                    } else {
                        res.status(401).send({
                            success: false,
                            msg: "Unauthorized access due expired session",
                            status: 401,
                        });
                    }
                } catch (ex) {
                    console.log("exception: " + ex);
                    res
                        .status(400)
                        .send({ success: false, msg: "Invalid token.", status: 400 });
                }
            })
            .use(function (req, res, next) {
                // This middleware will verify if the jwt is not compromised after user logged out
                getUserStateToken(req.auth).then(data => {
                    if (data == null) {
                        console.log("Compromised Token!")
                        res.send({
                            success: false,
                            msg: "Access Denied. Compromised Authorized Token.",
                            status: 401,
                        });
                        return;
                    } else {
                        setUserStateToken(req.auth, moment(moment().add(48, 'hours')).fromNow_seconds())
                            .then((success) => {
                                if (success) {
                                    console.log("Refresh Token Record Updated")
                                }
                            })
                            .catch((error) => res.json(error));
                        next();
                    }
                })
            })
            .use(isValid())
    );
}

function isValid() {
    return (
        compose()
            // Attach user to request
            .use(async function (req, res, next) {
                UserService.findOne({ _id: req.user._id, isDeleted: false, isEmailVerified: true })
                    .then(user => {
                        if (user == null) {
                            res.status(401).send({
                                success: false,
                                msg: "Unauthorized access due unverified email",
                                status: 401,
                            });
                        } else if (user.isActive == false) {
                            var errors = {
                                success: false,
                                status: 401,
                                msg: "Your account has been suspended by admin",
                            };
                            res.status(401).send(errors);
                            return;
                        } else {
                            next();
                        }
                    });
            })
    );
}

exports.isAuthenticated = isAuthenticated; 