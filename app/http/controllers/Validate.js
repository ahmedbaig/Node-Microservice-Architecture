const Joi = require("joi");
//************************ VALIDATE USER REGISTER DATA ***********************//
function validateRegisterData(userData) {
    const schema = Joi.object().keys({
        userName: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(5).required(),
        phoneNo: Joi.number().required(),
        role: Joi.number().valid([1, 2, 3, 4, 5]).required(),
    });
    return Joi.validate(userData, schema);
}

//************************ VALIDATE USER LOGIN DATA ***********************//
function validateLoginData(userData) {
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(5),
        role: Joi.number(),
        gcm_id: Joi,
        platform: Joi.string(),
    });
    return Joi.validate(userData, schema);
}

//************************ VALIDATE USER PROFILE EDIT DATA ***********************//
const validateUserEditData = async(data) => {
    const schema = Joi.object().keys({
        firstName: Joi.string(),
        lastName: Joi.string(),
        bio: Joi.string(),
        userName: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
        province: Joi.string(),
        address: Joi.string(),
        phoneNo: Joi.number(),
        gcm_id: Joi.string(),
        postalCode: Joi.number().optional(),
        platform: Joi.string(),
    });
    return Joi.validate(data, schema);
};

exports.validateRegisterData = validateRegisterData;
exports.validateLoginData = validateLoginData;
exports.validateUserEditData = validateUserEditData;