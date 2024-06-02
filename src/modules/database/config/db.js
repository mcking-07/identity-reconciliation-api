const { Pool } = require('pg');
const config = require('../../config');

const pool = new Pool(config.repository.db);

module.exports = pool;
