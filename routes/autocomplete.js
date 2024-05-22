const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

router.get('/', (req, res) => {
  const partialQuery = req.query.query;

  const autocompleteQuery = `
    SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName, birthYear
    FROM people
    WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
    LIMIT 10
  `;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    connection.query(autocompleteQuery, [`%${partialQuery}%`], (error, results) => {
      connection.release();
      if (error) {
        console.error('Error executing autocomplete MySQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        const suggestions = results.map((row) => {
          return { fullName: row.fullName, birthYear: row.birthYear };
        });
        res.json(suggestions);
      }
    });
  });
});

module.exports = router;




















