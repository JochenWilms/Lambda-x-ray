'use strict';
const startTime = process.hrtime();
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk')); //captures all AWS services in X-Ray
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
AWSXRay.captureHTTPsGlobal(require('http'));
const http =require('http'));
const mysql = AWSXRay.captureMySQL(require('mysql'));
const pg = AWSXRay.capturePostgres(require('pg'));

exports.handler = (event, context, callback) => {
    // TODO implement
    console.log("lambda executed");
    console.log(event);
    console.log("listed records:")
    event.Records.forEach(function(element) {
      console.log(element);
    });
    callback(null, 'Hello from Lambda');
};
