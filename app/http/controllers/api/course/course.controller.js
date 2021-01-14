"use strict";

const path = require("path");
var mongoose = require("mongoose");
const _ = require("lodash");

exports.get = async function(req, res) {
    try {
    } catch (error) {
        res.send({ success: false, message: error.message });
    }
};