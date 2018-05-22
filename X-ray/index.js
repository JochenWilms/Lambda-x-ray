'use strict';
const startTime = process.hrtime();
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk')); //captures all AWS services in X-Ray
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
AWSXRay.captureHTTPsGlobal(require('http'));
const http =require('http'));
const mysql = AWSXRay.captureMySQL(require('mysql'));
const pg = AWSXRay.capturePostgres(require('pg'));


var coldStart= true;
console.log('Loading hello world function');

var bucketName = process.env.S3_BUCKET;


function genKey() {
    var segment = new AWSXRay.Segment(name, [optional root ID], [optional parent ID]);
    AWSXRay.setSegment(segment);

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

function getS3Object(event,callback){
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
            callback(null,dataobject);
        });
}

function putS3Object(event,callback){
        s3.putObject({
            Bucket: bucketName,
            Key: genKey(),
            Body: JSON.stringify(event.body),
        },function (resp) {
            //console.log(arguments);
            console.log('Successfully uploaded package.');
            callback(null, JSON.stringify(event));
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

exports.handler = function(event, context, callback) {

  if (coldStart) {
      var diff = process.hrtime(startTime);
      console.log("Cold Start, First time the handler was called since this function was deployed in this container");
      console.log("time to load all packages: %ds %dms", diff[0], diff[1]/1000000);
  }
  coldStart = false;

  if (!bucketName) {
    callback(new Error(`S3 bucket not set`));
  }
  console.log(event)
  if (event.http_method == "GET"){
      getS3Object(event,callback);
  }else{
      putS3Object(event,callback);
      HttpCall();
      mysqlCall();
  }
};
