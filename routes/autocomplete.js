const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Autocomplete endpoint to fetch player name suggestions
router.get('/', (req, res, next) => {
  const query = req.query.query;

  const autocompleteQuery = `
    SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName
    FROM people
    WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
    LIMIT 10
  `;

  pool.query(autocompleteQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error('Error executing autocomplete MySQL query:', error);
      res.status(500).send('Internal server error');
    } else {
      const suggestions = results.map((row) => row.fullName);
      res.json(suggestions);
    }
  });
});

module.exports = router;
