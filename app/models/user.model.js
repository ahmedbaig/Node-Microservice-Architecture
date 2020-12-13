const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/default.json");
const fs = require("fs");
var privateKEY = fs.readFileSync('app/config/cert/private.key', 'utf8');
const moment = require("moment");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        max: 30,
    },
    lastName: {
        type: String,
        max: 30,
    },
    userName: {
        type: String,
        max: 100,
        required: false,
        unique: true,
        default: "username",
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    accountType: {
        type: Number,
        default: 0,
    },
    bio: {
        type: String,
        default: null,
    },
    dob: {
        type: Date,
    },
    address: {
        type: String,
        default: null,
    },
    postalCode: {
        type: Number,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    country: {
        type: String,
        default: null,
    },
    province: {
        type: String,
        default: null,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneNoVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    profile_img: {
        type: String,
        default: "https://easy-1-jq7udywfca-uc.a.run.app/public/images/user.png",
    },
    failedPasswordsAttempt: {
        isBlocked: {
            type: Boolean,
            default: false,
        },
        count: {
            type: Number,
            default: 0,
        },
        blockedTill: {
            type: Date,
            default: null,
        },
    },
    gcm_id: {
        type: [String],
    },
    platform: {
        type: String,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    updatedDate: {
        type: Date,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
});

function generateAuthToken(_id) {
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
    return token;
}

const UserData = mongoose.model("users", userSchema);

exports.UserData = UserData;
exports.generateAuthToken = generateAuthToken;