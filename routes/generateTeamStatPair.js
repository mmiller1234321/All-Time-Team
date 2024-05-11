const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// Function to generate the next team and stat pair
function generateNextTeamStatPair() {
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
        setTimeout(generateNextTeamStatPair, 72 * 60 * 60 * 1000);
      } else {
        console.log('No team and stat pairs found in the database');
      }
    }
  });
}

// Generate the first team and stat pair on server start
generateNextTeamStatPair();

// Route to handle fetching the next team and stat pair
router.get('/team-stat-pair', (req, res, next) => {
  pool.query('SELECT team_name, stat_name FROM gameboard ORDER BY date ASC LIMIT 1', (error, results) => {
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

module.exports = router;












