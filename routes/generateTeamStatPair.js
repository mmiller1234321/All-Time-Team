const express = require('express');
const router = express.Router();
const pool = require('../db/db.js'); // Import the pool from your db.js file

// Function to generate the next team and stat pair
function generateNextTeamStatPair() {
  pool.query('SELECT team_name, stat_name, perfect_score FROM generated_tables LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else if (results.length > 0) {
      const teamName = results[0].team_name;
      const statName = results[0].stat_name;
      const perfectScore = results[0].perfect_score;

      pool.query('INSERT INTO gameboard (team_name, stat_name, perfect_score) VALUES (?, ?, ?)', [teamName, statName, perfectScore], (error) => {
        if (error) {
          console.error('Error inserting data into gameboard table:', error);
        } else {
          console.log(`Inserted ${teamName} - ${statName} - ${perfectScore} into gameboard`);
        }

        // Set timer for 8 minutes instead of 72 hours
        setTimeout(generateNextTeamStatPair, 8 * 60 * 1000); // 8 minutes * 60 seconds * 1000 milliseconds
      });
    } else {
      console.log('No team and stat pairs found in the database');
    }
  });
}

// Generate the first team and stat pair on server start
generateNextTeamStatPair();

// Route to handle fetching the next team and stat pair
router.get('/team-stat-pair', (req, res) => {
  pool.query('SELECT id, team_name, stat_name, perfect_score FROM gameboard ORDER BY date ASC LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching team and stat pair:', error);
      res.status(500).send('Internal Server Error');
    } else if (results.length > 0) {
      const id = results[0].id;
      const teamName = results[0].team_name;
      const statName = results[0].stat_name;
      const perfectScore = results[0].perfect_score;
      res.json({ id: id, team: teamName, stat: statName, perfect_score: perfectScore });
    } else {
      console.log('No team and stat pairs found in the gameboard table');
      res.status(404).send('No team and stat pairs found');
    }
  });
});

module.exports = router;



























































