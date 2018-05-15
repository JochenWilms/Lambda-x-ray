'use strict'
const startTime = process.hrtime();
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
AWSXRay.captureHTTPsGlobal(require('http'));
const http =require('http');
const mysql = AWSXRay.captureMySQL(require('mysql'));
const pg = AWSXRay.capturePostgres(require('pg'));

const express = require('express')

const app = express()


var bucketName = process.env.S3_BUCKET;



function genKey() {


    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

function getS3Object(event,data){
    var key = "2018:05:08:07:16:34";
    if(event.key){
        key = event.body.key;
    }
    s3.getObject({
            Bucket: bucketName,
            Key: key
        }, function(resp) {
            data = resp.data;
            console.log(resp);
        });
}

function putS3Object(event){
        s3.putObject({
            Bucket: bucketName,
            Key: genKey(),
            Body: JSON.stringify(event),
        },function (resp) {
            console.log(resp);
        });
}

function HttpCall(){
  var options = {
    host: 'www.google.com',
    path: '/index.html'
  };
  var req = http.get(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      //console.log('BODY: ' + body);
      // ...and/or process the entire body here.
    })
  });

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
}

function mysqlCall(){
  var connection = mysql.createConnection({
     host     : 'remote-mysql3.servage.net',
     user     : 'cronosTest',
     password : 'jochentest1',
     database : 'cronosTest',
   });
   connection.connect(function(err) {
         if (err) throw err;

         console.log('Connection Successful');
   });


 connection.query("SELECT * FROM testTable;")
     .on('error', function(err) {
         console.log( err );

     })
     .on('result', function( data ) {
         console.log('YourData',data);
     });
   connection.end();

   console.log("end mysql");
}

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
app.use(awsServerlessExpressMiddleware.eventContext())


app.get('/', (req, res) => {
    console.log(req);
    var data;
    getS3Object(req.apiGateway.event,data)
    res.send(req.apiGateway.event);
})

app.post('/', (req, res) => {
    //mysqlCall();
    //HttpCall();
    putS3Object(req.apiGateway.event)
    res.json(req.apiGateway.event);
})


module.exports = app
