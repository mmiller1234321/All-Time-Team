const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

router.post('/', (req, res) => {
  const { totalScore, teamName, statName } = req.body;

  // Save the total score, team name, and stat name to the database
  pool.query('INSERT INTO generated_tables (team_name, stat_name, total_score) VALUES (?, ?, ?)', [teamName, statName, totalScore], (error, results) => {
    if (error) {
      console.error('Error saving total score:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Total score saved successfully:', totalScore);
      res.status(200).json({ message: 'Total score saved successfully' });
    }
  });
});

module.exports = router;

