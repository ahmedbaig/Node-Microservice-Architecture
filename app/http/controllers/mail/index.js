"use strict";
const UserService = require('../services/user.service')
const nodemailer = require("nodemailer");
const config = require('config')
const defaults = require("../../../../config/default.json");
var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

//************************ SEND VERIFY USER EMAIL ***********************//
const sendUserVerifyEmail = async ({ token, user }) => {
    var mailOptions = {
        to: user.email,
        from: process.env.NODEMAILER_USER,
        subject: "Email Verification",
        text: "You are receiving this because you have requested email verification for your account.\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            config.get("origin") +
            "/verify-email/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email if you did not create an account.\n"+
            "\n\n" +
            "This link will expire in " + defaults.ACCESS_TOKEN.EXPIRE_NUM + defaults.ACCESS_TOKEN.EXPIRE_VALUE
    };
    return new Promise((resolve, reject) => {
        try {
            transporter.sendMail(mailOptions, async function (err, info) {
                if (err) {
                    reject({ msg: err, status: 502, success: false })
                    return;
                }
                await UserService.findOneAndUpdate({ _id: user._id, email: user.email }, { isEmailVerified: false },
                    async (err, result) => {
                        if (err) {
                            reject({ success: false, msg: err, status: 409 });
                            return;
                        }
                        var data = {
                            success: true,
                            msg: "Please check your email for account verification!",
                            status: 200
                        };
                        resolve(data);
                        return;
                    }
                );
            });
        } catch (e) {
            reject({ success: false, msg: e.message, status: 500 });
            return;
        }
    })
};

//************************ SEND FORGOT PASS EMAIL ***********************//
const sendForgotPasswordEmail = async ({ token, user }) => {
    var mailOptions = {
        to: user.email,
        from: process.env.NODEMAILER_USER,
        subject: "Password Reset",
        text:
            "You are receiving this because you (or someone else) have requested password reset for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            config.get("origin") +
            "/reset-password/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email if you did not create an account.\n"+
            "\n\n" +
            "This link will expire in " + defaults.ACCESS_TOKEN.EXPIRE_NUM + defaults.ACCESS_TOKEN.EXPIRE_VALUE
    };
    return new Promise((resolve, reject) => {
        try {
            transporter.sendMail(mailOptions, async function (err, info) {
                if (err) {
                    reject({ msg: err, status: 502, success: false })
                    return;
                }

                var data = {
                    success: true,
                    msg: "Please check your email for password reest link!",
                    status: 200
                };
                resolve(data);
                return;
            });
        } catch (e) {
            reject({ success: false, msg: e.message, status: 500 });
            return;
        }
    })
};

exports.sendUserVerifyEmail = sendUserVerifyEmail;
exports.sendForgotPasswordEmail = sendForgotPasswordEmail;