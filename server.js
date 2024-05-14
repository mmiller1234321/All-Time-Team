// Import the necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js');  // Ensure this is the promise pool from 'mysql2/promise'
const app = express();
require('dotenv').config();

// Middleware setup
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Function to fetch the first team_name and stat_name pair from generated_tables and insert into gameboard
async function fetchNextRow() {
  try {
    const [rows] = await pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1');
    if (rows.length > 0) {
      const { team_name: teamName, stat_name: statName } = rows[0];
      await pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName]);
      console.log(`Inserted ${teamName} - ${statName} into gameboard`);
      setTimeout(fetchNextRow, 72 * 60 * 60 * 1000); // Set to fetch the next row every 72 hours
    } else {
      console.log('No team and stat pairs found in the database');
    }
  } catch (error) {
    console.error('Error in fetchNextRow function:', error);
  }
}

fetchNextRow(); // Start the fetchNextRow function

// Route to handle fetching the next team and stat pair
app.get('/generateTeamStatPair/team-stat-pair', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT id, team_name, stat_name FROM gameboard ORDER BY date ASC LIMIT 1');
    if (results.length > 0) {
      const { id, team_name: teamName, stat_name: statName } = results[0];
      res.json({ id, team: teamName, stat: statName });
    } else {
      console.log('No team and stat pairs found in the gameboard table');
      res.status(404).json({ error: 'No team and stat pairs found' });
    }
  } catch (error) {
    console.error('Error fetching team and stat pair:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Route to fetch team_name and stat_name from gameboard
app.get('/fetch-gameboard', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT team_name, stat_name FROM gameboard LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'No team and stat pairs found' });
    }
  } catch (error) {
    console.error('Error fetching team and stat pair:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Route to handle search functionality
app.use('/search', require('./routes/search'));

// Route to handle autocomplete functionality
app.use('/autocomplete', require('./routes/autocomplete'));

// Route to handle saving score
app.use('/saveScore', require('./routes/saveScore'));

// 404 route
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
