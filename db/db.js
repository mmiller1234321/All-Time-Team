require('dotenv').config();
const mysql = require('mysql2/promise'); // Import the promise wrapper

// Create a pool using the CLEARDB_MAUVE_URL from your environment variables
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit if there is a connection error
  }
}

testConnection();

pool.on('error', (err) => {
  console.error('MySQL connection pool error:', err);
  process.exit(1); // Exit on pool errors
});

module.exports = pool;

