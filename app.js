'use strict';
const fs = require("fs");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan"); 
const cors = require("cors");
global.ROOTPATH = __dirname;
var app = express();
var io = require("socket.io")();
app.io = io;

const swaggerUi = require("swagger-ui-express"),
    swaggerDocument = require("./swagger.json");

app.use(cors());

// create a write stream (in append mode) for system logger
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(logger('common', { stream: accessLogStream }))

// Express TCP requests parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser());

// Static rendering
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");

// Route definitions
app.use('/cache', require('./app/cache'))
app.use("/console", require('./routes/console'));

app.use("/api", require("./routes/api"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require('./sockets')(app);
require("./routes/web")(app);

module.exports = app;