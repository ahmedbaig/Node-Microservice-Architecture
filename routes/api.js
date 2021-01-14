var express = require("express");
var app = express();

app.use("/admin", require('../app/http/controllers/api/admin'));

app.use("/course/admin", require('../app/http/controllers/api/course/admin'));

app.use("/users/admin", require('../app/http/controllers/api/user/admin'));

app.use("/course", require('../app/http/controllers/api/course'));

app.use("/users", require('../app/http/controllers/api/user')); 

module.exports = app;