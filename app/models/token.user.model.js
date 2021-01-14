"use strict";
const mongoose = require("mongoose");
const moment = require("moment");
const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Date,
    default: moment().add(1, "hours"), // Expiration set to 1 hours on dev and 5 minutes on staging
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
});
exports.Token = mongoose.model("token", tokenSchema); 
