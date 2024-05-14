require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  uri: process.env.CLEARDB_MAUVE_URL
});

pool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  });

pool.on('error', (err) => {
  console.error('MySQL connection pool error:', err);
  process.exit(1);
});

module.exports = pool;




