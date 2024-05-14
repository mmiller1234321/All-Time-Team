const express = require('express');
const router = express.Router();
const db = require('../db/db.js'); // Ensure db.js is configured to use mysql2/promise

// Route to handle saving scores
router.post('/', async (req, res) => {
  const { total_score, team_name, stat_name, gameboard_id } = req.body;

  // Check if all necessary fields are provided
  if (!total_score || !team_name || !stat_name || !gameboard_id) {
    console.error('Missing one or more required fields: total_score, team_name, stat_name, gameboard_id');
    return res.status(400).json({ error: 'Missing one or more required fields' });
  }

  try {
    const result = await db.promise().query(
      'INSERT INTO games (team_name, stat_name, total_score, gameboard_id) VALUES (?, ?, ?, ?)',
      [team_name, stat_name, total_score, gameboard_id]
    );
    
    console.log('Total score inserted successfully:', result);
    res.status(200).json({ message: 'Total score inserted successfully', result: result[0] });
  } catch (error) {
    console.error('Error inserting total score:', error);
    res.status(500).json({ error: 'An error occurred while inserting total score', details: error.message });
  }
});

module.exports = router;




















































