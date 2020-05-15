const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      prettyPrint: true,
      colorize: true,
    }),
  ],
});

module.exports = logger;
