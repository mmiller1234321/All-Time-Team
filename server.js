// Import the necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js');
const app = express();

require('dotenv').config();

// Middleware setup
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes setup
app.use('/search', require('./routes/search'));
app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/saveScore', require('./routes/saveScore'));  // Corrected the route here

// Fetch the first team_name and stat_name pair from generated_tables and insert into gameboard
function fetchNextRow() {
  pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        
        pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName], (error, results) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
          }
        });

        setTimeout(fetchNextRow, 72 * 60 * 60 * 1000); // Set to fetch the next row every 72 hours
      } else {
        console.log('No team and stat pairs found in the database');
      }
    }
  });
}

fetchNextRow(); // Start the fetchNextRow function

// Route to fetch team_name and stat_name from gameboard
app.get('/fetch-gameboard', (req, res) => {
  pool.query('SELECT team_name, stat_name FROM gameboard LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching team and stat pair:', error);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        res.json({ team_name: teamName, stat_name: stat_name }); // Send response with team_name and stat_name
      } else {
        console.log('No team and stat pairs found in the gameboard table');
        res.status(404).send('No team and stat pairs found');
      }
    }
  });
});

// 404 route
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).send('Internal server error');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

