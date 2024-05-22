require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  uri: process.env.CLEARDB_MAUVE_URL,
  waitForConnections: true,
  connectionLimit: 10, // Limit the number of connections to prevent exceeding the max_user_connections
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  connection.release();
});

pool.on('error', (err) => {
  console.error('MySQL connection pool error:', err);
  process.exit(1);
});

module.exports = pool;













