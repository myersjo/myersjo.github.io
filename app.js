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

// http GET /about
app.get("/about", function (request, response) {
  response.sendFile(path.join(__dirname + '/assets/about.html'));
});

// http GET /contact
app.get("/contact", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/contact.html'));
});

// http GET /industry
app.get("/industry", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/industry.html'));
});

// http GET /students
app.get("/students", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/students.html'));
});
// http GET /why-join-iasa
app.get("/why-join-iasa", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/students.html'));
});

// http GET /downloads
app.get("/download", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/downloads.html'));
});

// http GET /privacy
app.get("/privacy", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/privacy-policy.html'));
});

// http GET /news
app.get("/news", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/news.html'));
});

// http GET /blog-template
app.get("/blog-template", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/blog-post.html'));
});

// http GET /industry-info-booklet
app.get("/industry-info-booklet", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/downloads/IASA-Industry-Info-Booklet.pdf'));
});

// http GET /sponsorship-booklet
app.get("/sponsorship-booklet", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/downloads/IASA-Sponsorship-Booklet-2017-2018.pdf'));
});

// http GET /student-handbook
app.get("/student-handbook", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/downloads/IASA-Student-Handbook-2017-2018-V1.1.pdf'));
});
// http GET /wp-content/uploads/2015/06/IASA-Student-Handbook-2017-2018-V1.1.pdf
app.get("/wp-content/uploads/2015/06/IASA-Student-Handbook-2017-2018-V1.1.pdf", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/downloads/IASA-Student-Handbook-2017-2018-V1.1.pdf'));
});

// http GET /annual-report-2017
app.get("/annual-report-2017", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/downloads/IASA-Annual-Report-2017-V1.0W.pdf'));
});

// http GET /dublin-aviation-summit-2018
app.get("/dublin-aviation-summit-2018", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/dublin-aviation-summit-2018.html'));
});

// http GET /iasa-aviation-career-expo
app.get("/iasa-aviation-career-expo", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/iasa-aviation-career-expo.html'));
});

// http GET /aircraft-leasing-career-slingshot-2018
app.get("/aircraft-leasing-career-slingshot-2018", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/aircraft-leasing-career-slingshot-2018.html'));
});

// http GET /committee-featured-ross-quinless
app.get("/committee-featured-ross-quinless", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/committee-featured-ross-quinless.html'));
});

// http GET /jan-series
app.get("/jan-series", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/jan-series.html'));
});

// http GET /iac-interview-mark-hegarty
app.get("/iac-interview-mark-hegarty", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/iac-interview-mark-hegarty.html'));
});

// http GET /das-2018
app.get("/das-2018", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/articles/das-2018.html'));
});

// http GET /top-10-reasons-internship/
app.get("/top-10-reasons-internship/", function (req, res) {
  res.sendFile(path.join(__dirname + '/assets/news.html'));
});

// 404 for page not found requests
app.get(function (request, response) {
  response.sendFile(path.join(__dirname + '/assets/index.html'));
});

// http POST /contact
app.post("/contact", function (req, res) {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.emailAddress;
  var message = req.body.message;
  var isError = false;
  var captchaRes = req.body['g-recaptcha-response'];

  console.log('\nCONTACT FORM DATA: '+ firstName + ' '+ lastName + ' '+ email + ' '+ message+ '\n');
  //console.log(captchaRes);
  
  // Verify reCaptcha response
  var secretKey = '6LfY2lcUAAAAAKJSZEjgpfY-RUPQ2IsTm76JPapY';
  var options = {
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + captchaRes,
    json: false // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function (parsedBody) {
      var gRes = JSON.parse(parsedBody);
      if(gRes.success === true) {
        // Success
        // create transporter object capable of sending email using the default SMTP transport
        var transporter = nodemailer.createTransport(mg(auth));

        // setup e-mail data with unicode symbols
        var mailOptions = {
          from: '"' + firstName + ' ' + lastName + '"' + '<' + email + '>', // sender address
          to: 'info@iasa.aero', // list of receivers
          subject: 'Message from Website Contact Form', // Subject line
          text: message,
          err: isError

        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log('\nERROR: ' + error+'\n');
            //   res.json({ yo: 'error' });
            res.sendStatus(400);
          } else {
               console.log('\nRESPONSE SENT: ' + info.response+'\n');
               res.sendStatus(200);
            //   res.json({ yo: info.response });
          }
        });
      }
      else {
        console.log("[SPAM]: reCaptcha failed " + gRes["challenge_ts"]);
        res.sendStatus(400);
      }
    })
    .catch(function (err) {
      // POST failed...
      console.log(err);
      res.sendStatus(400);
    });
  
  
});

app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname + '/assets/error.html'));
})

// Listen for an application request on designated port
server.listen(port, function () {
  console.log('Web app started and listening on http://localhost:' + port);
});