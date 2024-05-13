const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// POST route to save total score along with team_name and stat_name into games table
router.post('/', (req, res) => {
  const { totalScore, teamName, statName, gameboardId } = req.body;

  // Insert the score into the games table along with the fetched gameboardId
  pool.query(
    'INSERT INTO games (team_name, stat_name, total_score, gameboard_id) VALUES (?, ?, ?, ?)',
    [teamName, statName, totalScore, gameboardId],
    (error, results, fields) => {
      if (error) {
        console.error('Error inserting total score:', error);
        res.status(500).json({ error: 'An error occurred while inserting total score' });
      } else {
        console.log('Total score inserted successfully:', totalScore); // Log the total score
        res.status(200).json({ message: 'Total score inserted successfully' });
      }
    }
  );
});

module.exports = router;



















