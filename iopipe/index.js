'use strict';
const startTime = process.hrtime();

const AWS = require('aws-sdk'); //captures all AWS services in X-Ray
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const http =require('http');
const mysql = require('mysql');
const pg = require('pg');


var coldStart= true;
console.log('Loading hello world function');

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

function getS3Object(event,context){
    var key = "2018:05:08:07:16:34";
    if(event.body.key){
        key = event.body.key;
    }
    s3.getObject({
            Bucket: bucketName,
            Key: key
        }, function(err, data) {
            // Handle any error and exit
            if (err)
                console.log(err);
            let dataobject = data.Body.toString('utf-8');
            console.log(dataobject);
            context.succeed(dataobject);
        });
}

function putS3Object(event){
        s3.putObject({
            Bucket: bucketName,
            Key: genKey(),
            Body: JSON.stringify(event.body),
        },function (resp) {
            //console.log(arguments);
            console.log('Successfully uploaded package.');

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
   /*
   connection.query('SELECT * FROM testTable', function (error, results, fields) {
     if (error) throw error;
     console.log(results);
   });
   */
   console.log("end mysql");
}

var incrementing = 0;
// instantiate the iopipe library
const iopipeLib = require('@iopipe/core');

const iopipe = iopipeLib({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzODUzOTI1Mi0zZmQ4LTQxNDctOTYwMi0yZjVjYWZjYzg5MzUiLCJqdGkiOiIzNDZhNGNhNS0xNDM1LTQ4YzAtOWMwOS1lNDY4MzlmY2ZmOWIiLCJpYXQiOjE1MjY5NzM1ODEsImlzcyI6Imh0dHBzOi8vaW9waXBlLmNvbSIsImF1ZCI6Imh0dHBzOi8vaW9waXBlLmNvbSxodHRwczovL21ldHJpY3MtYXBpLmlvcGlwZS5jb20vZXZlbnQvLGh0dHBzOi8vZ3JhcGhxbC5pb3BpcGUuY29tIn0.QV8dNi_72XIblFveGWN1fEHPhJga7mjSlgfCrox6qWw' });

exports.handler = iopipe((event, context) => {
    context.iopipe.label('something-important-happened');
    context.iopipe.metric('incr', incrementing++);
    // context.iopipe.metric('another-key', 42);

    // run your code here normally
    if (!bucketName) {
      context.succeed(new Error(`S3 bucket not set`));
    }
    console.log(event)
    const mark = context.iopipe.mark;

    if (event.http_method == "GET"){
        getS3Object(event,context);
        context.succeed('This is my serverless function! Get');
    }else{
        mark.start('database');
            putS3Object(event);
        mark.end('database');
        mark.start('http');
            HttpCall();
        mark.end('http');
        mark.start('mysql');
            mysqlCall();
        mark.end('mysql');
        context.succeed('This is my serverless function!');

    }

  }
);
