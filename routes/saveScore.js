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
        console.error('Error saving total score:', error);
        res.status(500).json({ error: 'An error occurred while saving total score' });
      } else {
        console.log('Total score saved successfully');
        res.status(200).json({ message: 'Total score saved successfully' });
      }
    }
  );
});

module.exports = router;

