const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// Route to handle saving scores
router.post('/', (req, res) => {
  const { total_score, team_name, stat_name, id } = req.body;

  console.log('Attempting to insert score:', total_score, 'for team:', team_name, 'and stat:', stat_name, 'with ID:', id);

  pool.query(
    'INSERT INTO games (team_name, stat_name, total_score, id) VALUES (?, ?, ?, ?)',
    [team_name, stat_name, total_score, id],
    (error, results) => {
      if (error) {
        console.error('Error inserting total score:', error);
        res.status(500).json({ error: 'An error occurred while inserting total score' });
      } else {
        console.log('Total score inserted successfully:', results);
        res.status(200).json({ message: 'Total score inserted successfully' });
      }
    }
  );
});

module.exports = router;



















































