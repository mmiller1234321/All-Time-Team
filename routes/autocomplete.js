const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a database connection pool initialized

router.get('/', (req, res) => {
  const query = req.query.query;

  // Use placeholders (?) for parameters to prevent SQL injection
  const autocompleteQuery = `
    SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName
    FROM people
    WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
    LIMIT 10
  `;

  pool.query(autocompleteQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error('Error executing autocomplete MySQL query:', error);
      res.status(500).json({ error: 'Internal server error' }); // Send error response as JSON
    } else {
      const suggestions = results.map((row) => row.fullName);
      res.json(suggestions); // Send suggestions as JSON response
    }
  });
});

module.exports = router;


