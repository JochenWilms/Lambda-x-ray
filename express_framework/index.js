'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const binaryMimeTypes = [
  'application/json',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
]
const server = awsServerlessExpress.createServer(app, null, []);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
if (coldStart) {
    var diff = process.hrtime(startTime);
    console.log("Cold Start, First time the handler was called since this function was deployed in this container");
    console.log("time to load all packages: %ds %dms", diff[0], diff[1]/1000000);
}
coldStart = false;
