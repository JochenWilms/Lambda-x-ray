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
