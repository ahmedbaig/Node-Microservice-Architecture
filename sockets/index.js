const express = require("express");
var router = express.Router();
module.exports = function(app) {
    app.io.on("join", async function(client) {
        console.log("New client connected");

        client.on("disconnect", function() {
            console.log("Client disconnected");
        });

    });
}