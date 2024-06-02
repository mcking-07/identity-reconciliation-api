const uuid = require('uuid');
const { StatusCodes } = require('http-status-codes');
const { loggerFor } = require('../utils');

const logger = loggerFor(module);

const determineContentType = (acceptHeader) => acceptHeader || 'application/json';

const errorHandler = async (error, req, res, next) => {
  const errorId = uuid.v4();
  logger.error(`Error occurred while processing request (ID [${errorId}]): [${req.method}] [${req.url}]`, error?.stack || error);

  const contentType = determineContentType(req.headers?.accept);
  res.type(contentType).status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: `An error occurred while processing your request. It has been logged with ID: ${errorId}.`,
  });

  next();
};

module.exports = { errorHandler };
