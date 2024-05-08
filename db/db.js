require('dotenv').config();
const mysql = require('mysql2');

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  connection.release();
});

// Error handling for the connection pool
pool.on('error', (err) => {
  console.error('MySQL connection pool error:', err);
  process.exit(1);
});

module.exports = pool;

