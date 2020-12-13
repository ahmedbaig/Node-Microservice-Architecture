const { UserData } = require("../../../models/user.model");
const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

//************************ SEND VERIFY USER EMAIL ***********************//
const sendUserVerifyEmail = async({ token, user }) => {
    var mailOptions = {
        to: user.email,
        from: process.env.NODEMAILER_USER,
        subject: "Email Verification",
        text: "You are receiving this because you have requested email verification for your account.\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/verify-email/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email if you did not create an account.\n",
    };
    return new Promise((resolve, reject) => {
        try {
            transporter.sendMail(mailOptions, async function(err, info) {
                if (err) {
                    reject({ msg: err, status: 502, success: false })
                    return;
                }
                await UserData.findOneAndUpdate({ _id: user._id, email: user.email }, { isEmailVerified: false },
                    async(err, result) => {
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

exports.sendUserVerifyEmail = sendUserVerifyEmail;