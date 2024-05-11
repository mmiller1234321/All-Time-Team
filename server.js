const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db'); // Import pool object
const app = express();

// Load environmental variables from .env file
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Add this line to parse JSON request bodies

// Routes
app.use('/search', require('./routes/search'));
app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/save-score', require('./routes/saveScore'));

// Function to fetch the next row from the database
function fetchNextRow() {
  // Fetch the first row from the generated_tables table
  pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        
        // Insert the fetched data into the gameboard table without the date
        pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName], (error, results) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
            // Continue even if there's an error inserting into gameboard table
          }
        });

        // Start timer for 72 hours
        setTimeout(fetchNextRow, 72 * 60 * 60 * 1000);
      } else {
        console.log('No team and stat pairs found in the database');
      }
    }
  });
}

// Fetch the first row on server start
fetchNextRow();

// Route handler for GET requests to '/fetch-gameboard'
app.get('/fetch-gameboard', (req, res) => {
  // Logic to fetch gameboard data from your database or another source
  // Replace the example data with your actual implementation
  pool.query('SELECT team_name, stat_name FROM gameboard LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching team and stat pair:', error);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        res.json({ team: teamName, stat: statName });
      } else {
        console.log('No team and stat pairs found in the gameboard table');
        res.status(404).send('No team and stat pairs found');
      }
    }
  });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).send('Internal server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
