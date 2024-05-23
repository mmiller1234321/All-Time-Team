const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

router.get('/:id', (req, res) => {
  const gameboardId = req.params.id;
  pool.query('SELECT * FROM gameboard WHERE id = ?', [gameboardId], (error, results) => {
    if (error) {
      console.error('Error fetching gameboard:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else if (results.length > 0) {
      pool.query(
        'SELECT MAX(total_score) AS high_score FROM games WHERE gameboard_id = ?',
        [gameboardId],
        (error, scoreResults) => {
          if (error) {
            console.error('Error fetching high score:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
          } else {
            res.json({ gameboard: results[0], high_score: scoreResults[0].high_score || 'N/A' });
          }
        }
      );
    } else {
      res.status(404).send('Gameboard not found');
    }
  });
});

module.exports = router;











