"use strict";

const path = require("path");
var mongoose = require("mongoose");
const _ = require("lodash");

// exports.getRedisKeys = async function(req, res) {
//     try {
//         getRedisKeys(req, res)
//             .then((data) => {
//                 res.json(data);
//             })
//             .catch((error) => res.json(error));
//     } catch (error) {
//         res.send({ success: false, message: error.message });
//     }
// };