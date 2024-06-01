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
      res.json({ gameboard: results[0] });
    } else {
      res.status(404).send('Gameboard not found');
    }
  });
});

module.exports = router;













