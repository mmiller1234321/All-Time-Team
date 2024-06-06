const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

router.get('/', (req, res) => {
  const team_name = req.query.team;
  const stat_name = req.query.stat;

  const query = `
    SELECT MAX(total_score) AS high_score
    FROM games
    WHERE team_name = ? AND stat_name = ?
  `;
  
  const params = [team_name, stat_name];
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    
    connection.query(query, params, (error, results) => {
      connection.release();
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (results.length > 0 && results[0].high_score !== null) {
          res.json({ highScore: results[0].high_score });
        } else {
          res.json({ highScore: 0 });
        }
      }
    });
  });
});

module.exports = router;
