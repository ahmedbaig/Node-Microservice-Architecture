var express = require("express");
var app = express();
var path = require("path");
app.get("/health", function (req, res) {
  console.log({
    port: process.env.PORT,
    m_cluster: process.env.MONGO_CLUSTER,
  });
  res.json({
    success: true,
  });
});
app.get("/logs", function (req, res) {
  let filePath = ".."+"\\"+"access.log";
  console.log();
  res.sendFile(path.join(ROOTPATH, 'access.log'));
});
module.exports = app;
