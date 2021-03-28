
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const databaseURL = process.env['DATABASE_URL'];
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: databaseURL,
  ssl: true
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}