const express = require('express');
const expressListRoutes = require('express-list-endpoints');
const { StatusCodes } = require('http-status-codes');
const { loggerFor } = require('../utils');
const { identity } = require('../controllers');

const logger = loggerFor(module);

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Identity Reconciliation API' });
});

router.get('/healthcheck', (_req, res) => {
  res.status(StatusCodes.OK).json({ status: 'OK' });
});

router.route('/identity').post(identity);

const configure = (app, context, router) => {
  app.use(context, router);
};

const configureRoutes = (app, context) => {
  configure(app, context, router);
  expressListRoutes(app).forEach((route) => logger.info(`[${route.methods}] [${route.path}]`));
};

module.exports = configureRoutes;
