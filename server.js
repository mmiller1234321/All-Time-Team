require('dotenv').config(); // Load environmental variables from .env file

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // Import the path module

const app = express();
app.use(cors());

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

// Endpoint to fetch a random team name
app.get('/randomTeam', (req, res) => {
  // Fetch a random team name from the generated_tables table
  pool.query('SELECT team_name FROM generated_tables ORDER BY RAND() LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching random team:', error);
      res.status(500).send('Internal server error');
    } else {
      const randomTeam = results[0] ? results[0].team_name : 'Default Team Name'; // Default value if no team found
      res.send(randomTeam);
    }
  });
});

// Endpoint to fetch a random stat
app.get('/randomStat', (req, res) => {
  // Fetch a random stat name from the generated_tables table
  pool.query('SELECT stat_name FROM generated_tables ORDER BY RAND() LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching random stat:', error);
      res.status(500).send('Internal server error');
    } else {
      const randomStat = results[0] ? results[0].stat_name : 'Default Stat Name'; // Default value if no stat found
      res.send(randomStat);
    }
  });
});

// Search endpoint to fetch player stats
app.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat;

  let query;
  let params;

  // Logic for team associations ...
  // (Your existing logic for the '/search' endpoint remains unchanged)

});

// Autocomplete endpoint to fetch player name suggestions ...
// (Your existing autocomplete endpoint remains unchanged)

// Serve the static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
