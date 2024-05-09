const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const NodeCache = require('node-cache');

// Create MySQL connection pool using ClearDB connection URL
const pool = require('../db/db.js');

// Create a cache with a TTL of 72 hours (in seconds)
const cache = new NodeCache({ stdTTL: 259200 });

// Route to generate team and stat pairs
router.get('/', (req, res, next) => {
  // Check if the data exists in the cache
  const cachedData = cache.get('teamStatPair');
  if (cachedData) {
    res.json(cachedData);
  } else {
    // Fetch a unique team and stat pair from the database
    pool.query('SELECT * FROM generated_tables ORDER BY RAND() LIMIT 1', (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal server error');
      } else {
        if (results.length > 0) {
          const teamName = results[0].team_name;
          const statName = results[0].stat_name;
          const teamStatPair = { team: teamName, stat: statName };
          // Cache the data with a TTL of 72 hours
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

