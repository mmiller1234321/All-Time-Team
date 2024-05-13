const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');
// check out post '/'
router.post('/', (req, res) => {
  const { totalScore, teamName, statName, gameboardId } = req.body;

  console.log('Attempting to insert score:', totalScore, 'for team:', teamName, 'and stat:', statName, 'with gameboard ID:', gameboardId); //are all the values being passed in correctly?

  pool.query(
    'INSERT INTO games (team_name, stat_name, total_score, gameboard_id) VALUES (?, ?, ?, ?)',
    [teamName, statName, totalScore, gameboardId],
    (error, results, fields) => {
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

module.exports = router; // check this post request to see if it is working correctly 
















































