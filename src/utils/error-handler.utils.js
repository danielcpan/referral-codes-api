const expressValidation = require('express-validation');
const APIError = require('./APIError.utils');

module.exports = {
  convertToAPIError: (err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
      const unifiedErrorMessage = err.errors.map((error) => error.messages.join('. ')).join(' and ');
      const validationError = new APIError(unifiedErrorMessage, err.status, true);

      return next(validationError);
    } if (!(err instanceof APIError)) {
      const apiError = new APIError(err.message, err.status);

      return next(apiError);
    }
    return next(err);
  },
  httpError: (errorCode) => (req, res, next) => {
    const err = new APIError('API not found', errorCode);

    return next(err);
  },
  log: (err, req, res, next) => { // eslint-disable-line no-unused-vars
    res.status(err.status || 500).json({
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
  },
};
