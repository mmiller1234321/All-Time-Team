const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Route to fetch highest scores
router.get('/', (req, res) => {
  // Fetch highest scores from the database
  pool.query('SELECT team_name, stat_name, MAX(total_score) AS highest_score FROM generated_tables GROUP BY team_name, stat_name', (error, results) => {
    if (error) {
      console.error('Error fetching highest scores:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Highest scores fetched successfully');
      res.status(200).json(results);
    }
  });
});

module.exports = router;
