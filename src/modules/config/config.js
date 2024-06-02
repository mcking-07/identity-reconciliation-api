const fs = require('fs');
const path = require('path');

require('dotenv').config();

// ? for future enhancements.
const configFile = path.join(__dirname, process.env.CONFIG_FILE_PATH || '../../../config.json');
const config = JSON.parse(fs.readFileSync(configFile)) || {};

config.port = process.env.PORT || 4000;

config.repository = {
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  }
};

module.exports = config;
