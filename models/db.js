const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'recipe_db',
  password: 'holyshit',
  port: 5432,
});

module.exports = pool;
