"use strict"; 
const moment = require("moment");
const config = require("../../../../config/default.json");

const jwt = require("jsonwebtoken");
const fs = require("fs");
var privateKEY = fs.readFileSync('config/cert/private.key', 'utf8');

const TokenService = require('./token.service');
const UserService = require('./user.service');

function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

async function createToken(user, token) {
    return new Promise((resolve, reject) => {
        let body = {
            userId: user._id,
            token,
            expiresIn: moment().add(config.ACCESS_TOKEN.EXPIRE_NUM, config.ACCESS_TOKEN.EXPIRE_VALUE),
        };
        try {
            TokenService.create(body).then(token => {
                resolve({
                    success: true,
                    token,
                    msg: "Token generated successfully",
                });
            }).catch(err => { throw err; })
        } catch (ex) {
            reject({ success: false, status: 500, msg: ex })
        }
    })
}

exports.token = async function (data, { errorCallback, callback }) { 
    var token = Buffer.from(generateOTP()).toString("base64");
    UserService.findOne({ email: data.email }).then(async function (user) { 
        if (!user) {
            return errorCallback({
                success: false,
                status: 400,
                msg: "No account with this email exists.",
            });
        } else if (user) {
            TokenService.findOne({ userId: user._id }).then(alreadyExist => {
                if (!alreadyExist) {
                    //   Token does not exist
                    createToken(user, token)
                        .then((data) => callback(data))
                        .catch((error => errorCallback({ success: false, status: 500, msg: error })))
                } else {
                    // Token exists
                    if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
                        //   Already exists and has not expired yet
                        if (alreadyExist) {
                            return errorCallback({
                                success: false,
                                status: 409,
                                msg: "A token already exists for this User. Please use it before it expires",
                            });
                        }
                    } else {
                        // Already exists and has expired; remove old one and get new.
                        TokenService.findOneAndRemove({ userId: user._id }).then(async () => {
                            createToken(user, token)
                                .then((data) => callback(data))
                                .catch((error => errorCallback({ success: false, status: 500, msg: error })))
                        });
                    }
                }
            }).catch(error => errorCallback({ success: false, status: 500, msg: error.message }));
        }
    }).catch(error => errorCallback({ success: false, status: 500, msg: error.message }));
};

exports.verify = async function (token, { errorCallback, callback }) {
    await TokenService.findOne({ token }).then(alreadyExist => {
        if (alreadyExist == null) {
            //   Token does not exist
            return errorCallback({
                success: false,
                status: 400,
                msg: "Token does not exist.",
            })
        } else {
            // Token exists
            if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
                //   Already exists and has not expired yet
                TokenService.findOneAndRemove({ token: alreadyExist.token })
                    .then(() => callback({ success: true }))
                    .catch((error => errorCallback({ success: false, status: 500, msg: error })));
            } else {
                // Already exists and has expired 
                return errorCallback({
                    success: false,
                    status: 401,
                    msg: "Token expired!"
                })
            }
        }
    });
};

exports.verifyNewAccountToken = async function (token, { errorCallback, callback }) { 
    TokenService.findOne({ token }).then(alreadyExist => { 
        if (alreadyExist == null) {
            //   Token does not exist 
            return errorCallback({
                success: false,
                status: 400,
                msg: "Token does not exist.",
            })
        } else {
            // Token exists
            if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
                //   Already exists and has not expired yet
                TokenService.findOneAndRemove({ token: alreadyExist.token })
                    .then(() => callback({ success: true, token: null, userId: alreadyExist.userId }))
                    .catch(error => errorCallback({ success: false, status: 500, msg: error }));
            } else {
                // Already exists and has expired get new token
                var new_token = Buffer.from(generateOTP()).toString("base64");
                let user = { _id: alreadyExist.userId };
                TokenService.findOneAndRemove({ token: alreadyExist.token })
                    .then(
                        async () => {
                            createToken(user, new_token)
                                .then((data) => callback({ success: true, token: data, userId: alreadyExist.userId }))
                                .catch(error => errorCallback({ success: false, status: 500, msg: error }));
                        }
                    ).catch(error => errorCallback({ success: false, status: 500, msg: error }));
            }
        }
    });
};

exports.generateAuthToken = (_id, callback) => {
    var i = process.env.ISSUER_NAME;
    var s = process.env.SIGNED_BY_EMAIL;
    var a = process.env.AUDIENCE_SITE;
    var signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn: "12h",
        algorithm: "RS256",
    };
    var payload = {
        _id: _id,
        expiresIn: moment().add(config.JWT.EXPIRE_NUM, config.JWT.EXPIRE_VALUE), // Expiration set to 12 hours on dev and 5 minutes on staging
    };
    var token = jwt.sign(payload, privateKEY, signOptions);
    return callback(token);
}

exports.createToken = createToken;