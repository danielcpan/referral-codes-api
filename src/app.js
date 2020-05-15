require('dotenv').config();
const express = require('express');
const httpStatus = require('http-status');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compress = require('compression');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const winstonInstance = require('./utils/winston.utils');
const routes = require('./routes/index.route');
const errorHandler = require('./utils/error-handler.utils');
const config = require('../config/config');

const app = express();

// MIDDLEWARE
if (config.ENV === 'developmet') app.use(morgan);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());
app.use(helmet());
app.use(cors());

// ENABLE DETAILED API LOGGING IN DEV ENV
if (config.ENV === 'development') {
  app.use(expressWinston.logger({
    winstonInstance,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true,
  }));
}

// MOUNT ALL ROUTES ON API
app.use('/api', routes);

// IF ERROR IS NOT AN INSTANCE OF APIERROR, CONVERT IT
app.use(errorHandler.convertToAPIError);
// CATCH 404 AND FORWARD TO ERROR HANDLER
app.use(errorHandler.httpError(httpStatus.NOT_FOUND));
// ERROR HANDLER
app.use(errorHandler.log);

module.exports = app;
