const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 259200 });

router.get('/', (req, res, next) => {
  const cachedData = cache.get('teamStatPair');
  if (cachedData) {
    res.json(cachedData);
  } else {
    pool.query('SELECT * FROM generated_tables ORDER BY RAND() LIMIT 1', (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal server error');
      } else {
        if (results.length > 0) {
          const teamName = results[0].team_name;
          const statName = results[0].stat_name;
          const totalScore = results[0].total_score;
          const teamStatPair = { team: teamName, stat: statName, totalScore: totalScore };
          cache.set('teamStatPair', teamStatPair);
          res.json(teamStatPair);
        } else {
          console.log('No team and stat pair found in the database');
          res.status(404).send('No team and stat pair found');
        }
      }
    });
  }
});

module.exports = router;


