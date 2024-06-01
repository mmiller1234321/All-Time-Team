require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  uri: process.env.CLEARDB_MAUVE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit the process if there's a connection error
  } else {
    console.log('Connected to MySQL database');
    connection.release(); // Release the connection back to the pool
  }
});

pool.on('error', (err) => {
  console.error('MySQL connection pool error:', err);
  // Depending on the error type, you may want to restart the app or handle it differently
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    process.exit(1); // Exit the process to trigger a restart
  }
});

module.exports = pool;

















