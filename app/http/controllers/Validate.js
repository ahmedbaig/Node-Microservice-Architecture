"use strict";
const Joi = require("joi");
//************************ VALIDATE USER REGISTER DATA ***********************//
function validateRegisterData(data) {
    const schema = Joi.object().keys({
        userName: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(5).required(),
        phoneNo: Joi.number().required()
    });
    return Joi.validate(data, schema);
}

//************************ VALIDATE USER LOGIN DATA ***********************//
function validateLoginData(data) {
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(5),
        type: Joi.string()
    });
    return Joi.validate(data, schema);
}

//************************ VALIDATE USER PROFILE EDIT DATA ***********************//
const validateUserEditData = async(data) => {
    const schema = Joi.object().keys({
        firstName: Joi.string(),
        lastName: Joi.string(), 
        userName: Joi.string(), 
        phoneNo: Joi.number()
    });
    return Joi.validate(data, schema);
};

exports.validateRegisterData = validateRegisterData;
exports.validateLoginData = validateLoginData;
exports.validateUserEditData = validateUserEditData;