const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

router.get('/', (req, res) => {
  pool.query('SELECT id, team_name, stat_name FROM gameboard ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching previous gameboards:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;











