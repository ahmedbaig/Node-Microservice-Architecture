const jwt = require("jsonwebtoken");
var compose = require("composable-middleware");
const fs = require("fs");
var publicKEY = fs.readFileSync("./app/config/cert/public.key", "utf8");
const moment = require("moment");
var { getUserStateToken } = require('../../cache/redis.service')

function isAuthenticated() {
    return (
        compose()
        // Attach user to request
        .use(function(req, res, next) {
            const token = req.header("Authorization");
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
                        code: 401,
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
                        code: 401,
                    });
                }
            } catch (ex) {
                console.log("exception: " + ex);
                res
                    .status(400)
                    .send({ success: false, msg: "Invalid token.", code: 400 });
            }
        })
        .use(function(req, res, next) {
            // This middleware will verify if the jwt is not compromised after user logged out
            getUserStateToken(req, res).then(data => {
                if (data == null) {
                    console.log("Safe zone!")
                    next();
                } else {
                    console.log("Compromised Token!")
                    res.send({
                        success: false,
                        msg: "Access Denied. Compromised Authorized Token.",
                        code: 401,
                    });
                    return;
                }
            })
        })
        .use(isEmailVerified())
        .use(getRole())
    );
}

function getRole() {
    return (
        compose()
        // Attach user to request
        .use(async function(req, res, next) {})
    );
}

function isEmailVerified() {
    return (
        compose()
        // Attach user to request
        .use(async function(req, res, next) {
            await UserData.findOne({ _id: req.user._id, isDeleted: false, isEmailVerified: true },
                (err, user) => {
                    if (user == null) {
                        res.status(401).send({
                            success: false,
                            msg: "Unauthorized access due unverified email",
                            code: 401,
                        });
                    } else if (user.isActive == false) {
                        var errors = {
                            success: false,
                            msg: "Your account has been suspended by admin",
                        };
                        res.status(401).send(errors);
                        return;
                    } else {
                        next();
                    }
                }
            );
        })
    );
}

exports.isAuthenticated = isAuthenticated;
exports.isEmailVerified = isEmailVerified;
exports.getRole = getRole;