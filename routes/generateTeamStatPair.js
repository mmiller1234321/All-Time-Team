const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Route to generate team and stat pairs
router.get('/', (req, res, next) => {
  // Fetch a unique team and stat pair from the database
  pool.query('SELECT * FROM generated_tables ORDER BY RAND() LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).send('Internal server error');
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        res.json({ team: teamName, stat: statName });
      } else {
        console.log('No team and stat pair found in the database');
        res.status(404).send('No team and stat pair found');
      }
    }
  });
});

module.exports = router;
