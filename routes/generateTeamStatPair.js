const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// This variable holds the ID of the last row fetched and inserted into the gameboard table.
let lastFetchedId = 0;

function generateNextTeamStatPair() {
  // This query selects the next row in the generated_tables based on the last fetched ID.
  const query = 'SELECT team_name, stat_name, perfect_score, id FROM generated_tables WHERE id > ? ORDER BY id ASC LIMIT 1';

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      // Retry immediately but this should ideally be a longer delay, possibly with exponential backoff.
      setTimeout(generateNextTeamStatPair, 1000 * 10); // Retry after 10 seconds
      return;
    }

    connection.query(query, [lastFetchedId], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        connection.release();
        // Set a retry with a proper delay if there's a query execution error.
        setTimeout(generateNextTeamStatPair, 1000 * 60 * 5); // Retry after 5 minutes
        return;
      }

      if (results.length > 0) {
        const { team_name: teamName, stat_name: statName, perfect_score: perfectScore, id } = results[0];
        lastFetchedId = id; // Update lastFetchedId to the id of the fetched row.

        // Insert the fetched data into the gameboard table.
        connection.query(
          'INSERT INTO gameboard (team_name, stat_name, perfect_score) VALUES (?, ?, ?)',
          [teamName, statName, perfectScore],
          (insertError) => {
            connection.release();
            if (insertError) {
              console.error('Error inserting data into gameboard table:', insertError);
            } else {
              console.log(`Inserted ${teamName} - ${statName} - ${perfectScore} into gameboard`);
            }
            // Schedule the next execution of this function to occur after 24 hours.
            setTimeout(generateNextTeamStatPair, 1000 * 60 * 60 * 24);
          }
        );
      } else {
        connection.release();
        console.log('Reached end of table, restarting cycle.');
        lastFetchedId = 0; // Reset the ID to start from the beginning of the table.
        setTimeout(generateNextTeamStatPair, 1000 * 60 * 5); // Retry after 5 minutes
      }
    });
  });
}

generateNextTeamStatPair();

router.get('/team-stat-pair', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Fetch the most recently inserted team and stat pair from the gameboard.
    connection.query('SELECT id, team_name, stat_name, perfect_score FROM gameboard ORDER BY ID DESC LIMIT 1', (error, results) => {
      connection.release();
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
});

module.exports = router;




























































































































































































































































































































































































