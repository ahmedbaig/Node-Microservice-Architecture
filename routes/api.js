var express = require("express");
var app = express();

app.use("/admin", require('../app/http/controllers/api/admin'));

app.use("/users/admin", require('../app/http/controllers/api/user/admin'));

app.use("/books/admin", require('../app/http/controllers/api/books/admin'));

app.use("/users", require('../app/http/controllers/api/user'));

app.use("/books", require('../app/http/controllers/api/books'));

module.exports = app;