// models/db.js
require('dotenv').config();          // (optional here if you already call it at the top of app.js)
const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port:     process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,

  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
