const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// Function to generate the next team-stat pair
function generateNextTeamStatPair() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error getting MySQL connection:`, err);
      setTimeout(generateNextTeamStatPair, 1000 * 10); // Retry in 10 seconds on error
      return;
    }

    // Check the number of entries in the gameboard table
    connection.query('SELECT COUNT(*) AS count FROM gameboard', (error, results) => {
      if (error) {
        console.error(`[${new Date().toISOString()}] Error checking gameboard entries:`, error);
        connection.release();
        setTimeout(generateNextTeamStatPair, 1000 * 60 * 5); // Retry in 5 minutes on error
        return;
      }

      const gameboardCount = results[0].count;

      // If no entries are found, insert a new team-stat pair
      if (gameboardCount === 0) {
        insertNextTeamStatPair(connection);
      } else {
        connection.release();
        console.log(`[${new Date().toISOString()}] Gameboard already has entries, not inserting a new pair.`);
        setTimeout(generateNextTeamStatPair, 1000 * 60 * 10); // Retry in 10 minutes
      }
    });
  });
}

// Function to insert the next team-stat pair
function insertNextTeamStatPair(connection) {
  const query = `
    SELECT gt.team_name, gt.stat_name, gt.perfect_score, gt.id 
    FROM generated_tables AS gt
    WHERE NOT EXISTS (
      SELECT 1 FROM gameboard AS gb WHERE gt.team_name = gb.team_name AND gt.stat_name = gb.stat_name
    )
    ORDER BY gt.id ASC 
    LIMIT 1`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] Error executing MySQL query:`, error);
      connection.release();
      setTimeout(generateNextTeamStatPair, 1000 * 60 * 5); // Retry in 5 minutes on error
      return;
    }

    if (results.length > 0) {
      const { team_name: teamName, stat_name: statName, perfect_score: perfectScore, id } = results[0];

      connection.query(
        'INSERT INTO gameboard (team_name, stat_name, perfect_score) VALUES (?, ?, ?)',
        [teamName, statName, perfectScore],
        (insertError) => {
          if (insertError) {
            console.error(`[${new Date().toISOString()}] Error inserting data into gameboard:`, insertError);
          } else {
            console.log(`[${new Date().toISOString()}] Inserted ${teamName} - ${statName} - ${perfectScore} into gameboard`);
          }
          connection.release();
          setTimeout(generateNextTeamStatPair, 1000 * 60 * 10); // Retry in 10 minutes
        }
      );
    } else {
      console.log(`[${new Date().toISOString()}] No new unique team-stat pair found, waiting to retry...`);
      connection.release();
      setTimeout(generateNextTeamStatPair, 1000 * 60 * 10); // Retry in 10 minutes
    }
  });
}

// Initial call to start the process
generateNextTeamStatPair();

// Router endpoint to get the current team-stat pair
router.get('/team-stat-pair', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error getting MySQL connection:`, err);
      res.status(500).send('Internal Server Error');
      return;
    }

    connection.query('SELECT id, team_name, stat_name, perfect_score FROM gameboard ORDER BY ID DESC LIMIT 1', (error, results) => {
      if (error) {
        console.error(`[${new Date().toISOString()}] Error fetching team and stat pair:`, error);
        res.status(500).send('Internal Server Error');
      } else if (results.length > 0) {
        const { id, team_name: teamName, stat_name: statName, perfect_score: perfectScore } = results[0];
        res.json({ id, team: teamName, stat: statName, perfect_score: perfectScore });
      } else {
        res.status(404).send('No team and stat pairs found in the gameboard');
      }
      connection.release();
    });
  });
});

module.exports = router;


























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































