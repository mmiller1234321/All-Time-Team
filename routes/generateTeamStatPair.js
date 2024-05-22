const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

let lastFetchedId = 0;

function generateNextTeamStatPair() {
  const query = 'SELECT team_name, stat_name, perfect_score, id FROM generated_tables WHERE id > ? ORDER BY id ASC LIMIT 1';

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      setTimeout(generateNextTeamStatPair, 1000 * 10);
      return;
    }

    connection.query(query, [lastFetchedId], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        connection.release();
        setTimeout(generateNextTeamStatPair, 1000 * 60 * 5);
        return;
      }

      if (results.length > 0) {
        const { team_name: teamName, stat_name: statName, perfect_score: perfectScore, id } = results[0];
        lastFetchedId = id;

        connection.query(
          'INSERT INTO gameboard (team_name, stat_name, perfect_score) VALUES (?, ?, ?)',
          [teamName, statName, perfectScore],
          (insertError) => {
            if (insertError) {
              console.error('Error inserting data into gameboard table:', insertError);
            } else {
              console.log(`Inserted ${teamName} - ${statName} - ${perfectScore} into gameboard`);
            }
            connection.release();
            setTimeout(generateNextTeamStatPair, 1400000);
          }
        );
      } else {
        console.log('No new team-stat pair found, waiting to retry...');
        connection.release();
        setTimeout(generateNextTeamStatPair, 1400000);
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

    connection.query('SELECT id, team_name, stat_name, perfect_score FROM gameboard ORDER BY ID DESC LIMIT 1', (error, results) => {
      if (error) {
        console.error('Error fetching team and stat pair:', error);
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











































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































