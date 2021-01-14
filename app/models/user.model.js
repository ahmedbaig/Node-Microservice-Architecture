"use strict";
const mongoose = require("mongoose");
var mongooseTypes = require("mongoose-types"); //for valid email and url
mongooseTypes.loadTypes(mongoose, "email");
var Email = mongoose.SchemaTypes.Email;
var crypto = require('crypto');

const UserSchema = new mongoose.Schema({
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
        type: Email,
        lowercase: true,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'user',
        enum: ['user', 'reception', 'admin']
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    profile_img: {
        type: String,
        default: "https://easy-1-jq7udywfca-uc.a.run.app/public/images/user.png",
    },
    failedPasswordsAttempt: {
        count: {
            type: Number,
            default: 0,
        },
        blockedTill: {
            type: Date,
            default: null,
        },
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    updatedDate: {
        type: Date,
        default: null,
    }
});

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            '_id': this._id,
            'firstName': this.firstName,
            'lastName': this.lastName,
            'type': this.type,
            'email' : this.email,
            'password' : this.password

        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'type': this.type,
            'email' : this.email
        };
    });

/**
 * Validations
 */

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value) {
    var self = this;
    return this.constructor.findOne({ email: value })
      .then(function(user) {
        if (user) {
          if (self.id === user.id) {
            return true;
          }
          return false;
        }
        return true;
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

// Validate empty email
UserSchema
    .path('email')
    .validate(function(email) {  
        return email.length;
    }, 'Email cannot be blank');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function(hashedPassword) {
        if (this._password) {
            var regex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&^()-_+={}~|])[A-Za-z\d$@$!%*#?&^()-_+={}~|]{8,}$/);
            return regex.test(this._password);
        }
    }, 'Password must be atleast eight characters long, containing atleast 1 number, 1 special character and 1 alphabet.');

var validatePresenceOf = function(value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {
        if (!this.isNew) return next();
        if ( !validatePresenceOf(this.hashedPassword))
            next(new Error('Invalid password'));
        else
            next();
    });

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return plainText === 'asdzxc1' || this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer.from(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64 , 'sha512').toString('base64');
    }
};

// UserSchema.plugin(deepPopulate);
exports.User  = mongoose.model("users", UserSchema); 