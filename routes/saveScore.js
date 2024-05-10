const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

router.post('/', (req, res) => {
  const { totalScore, teamName, statName } = req.body;

  pool.query(
    'INSERT INTO generated_tables (team_name, stat_name, total_score) VALUES (?, ?, ?)',
    [teamName, statName, totalScore],
    (error, results, fields) => {
      if (error) {
        console.error('Error inserting total score:', error);
        res.status(500).json({ error: 'An error occurred while inserting total score' });
      } else {
        console.log('Total score inserted successfully');
        res.status(200).json({ message: 'Total score inserted successfully' });
      }
    }
  );
});

module.exports = router;



