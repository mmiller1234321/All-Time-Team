const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

let lastFetchedId = 0;

function generateNextTeamStatPair() {
  const query = 'SELECT team_name, stat_name, perfect_score, id FROM generated_tables WHERE id > ? ORDER BY id ASC LIMIT 1';

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      setTimeout(generateNextTeamStatPair, 8 * 60 * 1000);
      return;
    }

    connection.query(query, [lastFetchedId], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        connection.release();
        setTimeout(generateNextTeamStatPair, 8 * 60 * 1000);
        return;
      }

      if (results.length > 0) {
        const { team_name: teamName, stat_name: statName, perfect_score: perfectScore, id } = results[0];
        lastFetchedId = id;

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
            setTimeout(generateNextTeamStatPair, 24 * 60 * 60 * 1000);
          }
        );
      } else {
        connection.release();
        console.log('Reached end of table, restarting cycle.');
        lastFetchedId = 0;
        setTimeout(generateNextTeamStatPair, 8 * 60 * 1000);
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



























































































































































































































































































































































































