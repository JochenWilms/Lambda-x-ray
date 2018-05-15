'use strict'
const startTime = process.hrtime();
var coldStart = true;
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
AWSXRay.captureHTTPsGlobal(require('http'));
const http =require('http');
const mysql = AWSXRay.captureMySQL(require('mysql'));
const pg = AWSXRay.capturePostgres(require('pg'));

//express framewor
const express = require('express')
const app = express()
//adding cloudwatch metrics
var metric = {
  MetricData: [ // required
    {
      MetricName: 'metric_test', // required
     /* Dimensions: [
        {
          Name: 'URL', // required
          Value: "" // required
        },
      // more items
      ],*/
      Timestamp: new Date(),
      Unit: 'count',
      Value: 0
    },
    /* more items */
  ],
  Namespace: 'lambda_new_metrics' /* required */
};

const cloudwatch = new AWS.CloudWatch({region: 'eu-west-1'});


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

function getS3Object(event,res){
    var key = "2018:05:08:07:16:34";
    if(event.key){
        key = event.key;
    }
    s3.getObject({
        Bucket: bucketName,
        Key: key
    }, function(err, data) {
        // Handle any error and exit
        if (err)
            console.log(err);
        let dataobject = data.Body.toString('utf-8');
        res.json(dataobject);
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

function test_metric(name,value,unit){
    metric.MetricData[0].Unit =unit;
    metric.MetricData[0].MetricName = name;
    metric.MetricData[0].Value = value;
    cloudwatch.putMetricData(metric, (err, data) => {
        if (err) {
            console.log(err, err.stack); // an error occurred
          } else {
            console.log(data);           // successful response
        }
    });
}

function handle_coldstart(){
    if (coldStart) {
      var diff = process.hrtime(startTime);
      console.log("Cold Start, First time the handler was called since this function was deployed in this container");
      console.log("time to load all packages:  %dms", ((diff[0]*1e9 + diff[1])/1000000));

      //we kan make a coldstart metric
      test_metric("coldStart",((diff[0]*1e9 + diff[1])/1000000),"ms"); // in miliseconds
  }
  coldStart = false;
}

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
app.use(awsServerlessExpressMiddleware.eventContext())

app.use(AWSXRay.express.openSegment('MyApp'));

app.get('/', (req, res) => {

    handle_coldstart();

    mysqlCall();
    HttpCall();
    if(req.apiGateway.event.store){

        putS3Object(req.apiGateway.event);
        res.json(req.apiGateway.event);
    }else{
        var data;
        getS3Object(req.apiGateway.event,res)

    }
    test_metric("test_metric",10,"count");


})

app.post('/', (req, res) => {
    mysqlCall();
    HttpCall();

})

app.use(AWSXRay.express.closeSegment());

module.exports = app
