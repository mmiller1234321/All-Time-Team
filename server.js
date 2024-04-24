const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { URL } = require('url');

const app = express();
app.use(cors());

// Create connection configuration
const dbConfig = {
  host: '127.0.0.1', // Your MySQL host
  port: 3306, // Your MySQL port
  user: 'root', // Your MySQL username
  password: '1102', // Your MySQL password
  database: 'baseballdb' // Your MySQL database name
};

// Establish the connection to the database
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit the process if connection fails
  }
  console.log('Connected to MySQL database');
});

// Error handling for database connection
connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
  process.exit(1); // Exit the process if connection error occurs
});

// Rest of your endpoints and server setup...

// Search endpoint to fetch player stats
app.get('/search', (req, res) => {
  // Your search logic here...
});

// Autocomplete endpoint to fetch player name suggestions
app.get('/autocomplete', (req, res) => {
  // Your autocomplete logic here...
});

// Server listening on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
