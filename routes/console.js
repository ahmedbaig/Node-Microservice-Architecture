var express = require("express");
var app = express();

app.get("/health", function(req, res) {
    console.log({
        port: process.env.PORT,
        m_cluster: process.env.MONGO_CLUSTER
    });
    res.json({
        success: true
    })
});
app.get("/logs", function(req, res) {
    res.sendFile(
        path.join(__dirname, "access.log")
    );
});
module.exports = app;