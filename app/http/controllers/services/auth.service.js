var async = require("async");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const { UserData, generateAuthToken } = require("../../../models/user.model");
const { Token } = require("../../../models/token.user.model");
const moment = require("moment");
const config = require("../../../config/default.json");

function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

async function createToken(user, token) {
    let body = {
        userId: user._id,
        token,
        expiresIn: moment().add(config.ACCESS_TOKEN.EXPIRE_NUM, config.ACCESS_TOKEN.EXPIRE_VALUE),
    };
    try {
        const token = new Token(body);
        await token.save();
        return {
            success: true,
            data: token,
            msg: "Token Generated successfully",
        };
    } catch (ex) {
        return { success: false, msg: "error", error: ex };
    }
}

exports.token = async function(data, res, callback) {
    var token = Buffer.from(generateOTP()).toString("base64");
    await UserData.findOne({ email: data.email }, async function(err, user) {
        if (!user) {
            res.status(200).send({
                success: false,
                msg: "No account with this email exists.",
            });
        } else if (user) {
            const alreadyExist = await Token.findOne({ userId: user._id });
            if (alreadyExist == null) {
                //   Token does not exist
                await createToken(user, token).then((data) => {
                    return callback(data);
                });
            } else {
                // Token exists
                if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
                    //   Already exists and has not expired yet
                    if (alreadyExist) {
                        var errr = {
                            success: false,
                            msg: "A token already exists for this User. Please use it before it expires",
                        };
                        res.status(409).send(errr);
                        return;
                    }
                } else {
                    // Already exists and has expired; remove old one and get new.
                    await Token.findOneAndRemove({ userId: user._id }).then(async() => {
                        await createToken(user, token).then((data) => {
                            return callback(data);
                        });
                    });
                }
            }
        }
    });
};

exports.verify = async function(token, res, callback) {
    const alreadyExist = await Token.findOne({ token });
    if (alreadyExist == null) {
        //   Token does not exist
        var errr = {
            success: false,
            msg: "Token does not exist.",
        };
        res.status(409).send(errr);
        return;
    } else {
        // Token exists
        if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
            //   Already exists and has not expired yet
            await Token.findOneAndRemove({ token: alreadyExist.token }).then(
                async() => {
                    return callback(true);
                }
            );
        } else {
            // Already exists and has expired
            var errr = {
                success: false,
                msg: "Token expired!",
            };
            res.status(409).send(errr);
        }
    }
};

exports.verifyNewAccountToken = async function(token, res, callback) {
    const alreadyExist = await Token.findOne({ token });
    if (alreadyExist == null) {
        //   Token does not exist
        var errr = {
            success: false,
            msg: "Token does not exist.",
        };
        res.status(409).send(errr);
        return;
    } else {
        // Token exists
        if (moment(alreadyExist.expiresIn).isSameOrAfter(moment()) == true) {
            //   Already exists and has not expired yet
            await Token.findOneAndRemove({ token: alreadyExist.token }).then(
                async() => {
                    return callback({ success: true, new_token: null });
                }
            );
        } else {
            // Already exists and has expired get new token
            var new_token = Buffer.from(generateOTP()).toString("base64");
            let user = { _id: alreadyExist.userId };
            await Token.findOneAndRemove({ token: alreadyExist.token }).then(
                async() => {
                    await createToken(user, new_token).then((data) => {
                        return callback({ success: false, new_token: data });
                    });
                }
            );
        }
    }
};

exports.createToken = createToken;
exports.generateOTP = generateOTP;