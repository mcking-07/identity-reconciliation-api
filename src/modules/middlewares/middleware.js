const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./handlers');

const configureMiddleware = (app) => {
  app.use(cors());

  app.use(express.json({
    verify: (req, _res, buf) => { req.rawBody = buf; },
    type: 'application/json',
    limit: '10mb'
  }));

  app.use(express.urlencoded({ extended: false }));

  app.use(errorHandler);
};

module.exports = configureMiddleware;
