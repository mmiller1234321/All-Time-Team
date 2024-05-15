const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

let lastFetchedId = 0; // This assumes the IDs are sequential and start from 1.

function generateNextTeamStatPair() {
  // Query to get the next team and stat pair, cycling back to the start after the last one
  const query = 'SELECT team_name, stat_name, perfect_score, id FROM generated_tables WHERE id > ? ORDER BY id ASC LIMIT 1';
  
  pool.query(query, [lastFetchedId], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      setTimeout(generateNextTeamStatPair, 8 * 60 * 1000); // Try again after 8 minutes
      return;
    }

    if (results.length > 0) {
      const { team_name: teamName, stat_name: statName, perfect_score: perfectScore, id } = results[0];
      lastFetchedId = id; // Update last fetched id

      pool.query(
        'INSERT INTO gameboard (team_name, stat_name, perfect_score) VALUES (?, ?, ?)',
        [teamName, statName, perfectScore],
        (error) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
          } else {
            console.log(`Inserted ${teamName} - ${statName} - ${perfectScore} into gameboard`);
          }
          setTimeout(generateNextTeamStatPair, 8 * 60 * 1000); // Schedule next generation
        }
      );
    } else {
      // If no results found (possibly end of table), reset the counter to zero and restart the cycle
      console.log('Reached end of table, restarting cycle.');
      lastFetchedId = 0;
      setTimeout(generateNextTeamStatPair, 8 * 60 * 1000); // Schedule next generation
    }
  });
}

// Initialize the process on server start
generateNextTeamStatPair();

// Route to handle fetching the current team and stat pair from gameboard
router.get('/team-stat-pair', (req, res) => {
  pool.query('SELECT id, team_name, stat_name, perfect_score FROM gameboard ORDER BY ID DESC LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching team and stat pair:', error);
      res.status(500).send('Internal Server Error');
    } else if (results.length > 0) {
      const { id, team_name: teamName, stat_name: statName, perfect_score: perfectScore } = results[0];
      res.json({ id, team: teamName, stat: statName, perfect_score: perfectScore });
    } else {
      res.status(404).send('No team and stat pairs found in the gameboard');
    }
  });
});

module.exports = router;






















































































































