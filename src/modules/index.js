const express = require('express');
const config = require('./config');
const { loggerFor } = require('./utils');
const { configureMiddleware } = require('./middlewares');
const { configureRoutes } = require('./routes');

require('dotenv').config();

const logger = loggerFor(module);

const app = express();
const PORT = config.port;

const context = '/api';
configureMiddleware(app);
configureRoutes(app, context);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}!`);
});
