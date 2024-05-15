const express = require('express');
const router = express.Router();
const pool = require('../db/db.js'); // Ensure this is the callback pool from 'mysql2'

router.get('/', (req, res) => {
  const gameboardId = req.query.id;

  if (!gameboardId) {
    return res.status(400).json({ error: 'Missing gameboard ID' });
  }

  const query = 'SELECT perfect_score FROM generated_tables WHERE id = ?';
  pool.query(query, [gameboardId], (error, results) => {
    if (error) {
      console.error('Error fetching optimal score:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      const { perfect_score } = results[0];
      return res.json({ optimal_score: perfect_score });
    } else {
      return res.json({ optimal_score: null });
    }
  });
});

module.exports = router;
