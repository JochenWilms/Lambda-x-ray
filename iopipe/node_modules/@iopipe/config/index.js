const tracePlugin = require('@iopipe/trace');
const eventInfoPlugin = require('@iopipe/event-info');

module.exports = {
  plugins: [tracePlugin(), eventInfoPlugin()]
};
