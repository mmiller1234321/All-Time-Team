const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

router.post('/', (req, res) => {
  const { total_score, team_name, stat_name, gameboard_id } = req.body;

  // Log the request body to check the values
  console.log('Request body:', req.body);

  // Check if all necessary fields are provided
  if (total_score == null || team_name == null || stat_name == null || gameboard_id == null) {
    console.error('Missing one or more required fields: total_score, team_name, stat_name, gameboard_id');
    return res.status(400).json({ error: 'Missing one or more required fields' });
  }

  console.log(`Attempting to insert score: ${total_score}, for team: ${team_name}, stat: ${stat_name}, with gameboard ID: ${gameboard_id}`);

  pool.query(
    'INSERT INTO games (total_score, team_name, stat_name, gameboard_id) VALUES (?, ?, ?, ?)',
    [total_score, team_name, stat_name, gameboard_id],
    (error, results) => {
      if (error) {
        console.error('Error inserting total score:', error);
        return res.status(500).json({ error: 'An error occurred while inserting total score', details: error.message });
      } else {
        console.log('Total score inserted successfully:', results);
        return res.status(201).json({ message: 'Total score inserted successfully', result: results });
      }
    }
  );
});

module.exports = router;





























































































































































































































