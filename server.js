const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());

const connection = mysql.createConnection({
  host: 'DESKTOP-P6I7QLQ',
  user: 'root',
  password: '1102',
  database: 'lahmansbaseballdb'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Search endpoint to fetch player stats
app.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat; // Add stat parameter

  // MySQL query to fetch player stats
  const query = `
    SELECT MAX(b.${stat}) AS max_stat_value
    FROM batting AS b
    JOIN people AS p ON b.playerID = p.playerID
    JOIN fielding AS f ON b.playerID = f.playerID
    JOIN teams AS t ON b.teamID = t.teamID
    JOIN (
      SELECT franchID
      FROM teams
      WHERE name = ?
      GROUP BY franchID
    ) AS t1 ON t.franchID = t1.franchID
    WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
      AND f.POS = ?
  `;

  connection.query(query, [team, playerName, position], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).send('Internal server error');
    } else {
      if (results.length > 0 && results[0].max_stat_value !== null) {
        const maxStatValue = results[0].max_stat_value;
        res.send(maxStatValue.toString());
      } else {
        console.log('No results found for the query');
        res.send('0'); // Return '0' if no records found or max_stat_value is null
      }
    }
  });
});

// Autocomplete endpoint to fetch player name suggestions
app.get('/autocomplete', (req, res) => {
  const query = req.query.query; // Get the query parameter from the request

  // MySQL query to fetch player name suggestions based on the input query
  const autocompleteQuery = `
    SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName
    FROM people
    WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
    LIMIT 10
  `;

  connection.query(autocompleteQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error('Error executing autocomplete MySQL query:', error);
      res.status(500).send('Internal server error');
    } else {
      const suggestions = results.map((row) => row.fullName);
      res.json(suggestions);
    }
  });
});

// Server listening on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
