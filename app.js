var path = require("path");
var express = require("express");
var fs = require('fs')
var logger = require("morgan");  
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var bodyParser = require('body-parser');
var nconf = require('nconf');
var auth =  require('./config.json');
var rp = require('request-promise');
const port = process.env.PORT || 8081;

// make a request app and create the server 
var app = express();
var server = require('http').createServer(app);

// include client-side assets and use the bodyParser
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log requests to stdout and also
// log HTTP requests to a file in combined format
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
app.use(logger('dev'));
app.use(logger('combined', { stream: accessLogStream }));

// http GET default page at /
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + '/assets/index.html'));
});

// 404 for page not found requests
app.get(function (request, response) {
  response.sendFile(path.join(__dirname + '/assets/index.html'));
});


app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname + '/assets/error.html'));
})

// Listen for an application request on designated port
server.listen(port, function () {
  console.log('Web app started and listening on http://localhost:' + port);
});