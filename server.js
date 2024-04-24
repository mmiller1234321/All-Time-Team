const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { URL } = require('url');

const app = express();
app.use(cors());

// Parse the ClearDB database URL
const dbUrl = process.env.CLEARDB_DATABASE_URL;
const dbUrlParts = new URL(dbUrl);

// Create connection configuration object
const dbConfig = {
  host: dbUrlParts.hostname,
  user: dbUrlParts.username,
  password: dbUrlParts.password,
  database: dbUrlParts.pathname.substr(1),
};

// Establish the connection to the database
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
  process.exit(1);
});

// Search endpoint to fetch player stats
app.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat;

  if (team === 'Cleveland Guardians') {
    const clevelandQuery = `
      SELECT MAX(b.${stat}) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = 'Cleveland Indians' OR t.name = 'Cleveland Guardians')
    `;

    connection.query(clevelandQuery, [playerName, position], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal server error');
      } else {
        if (results.length > 0 && results[0].max_stat_value !== null) {
          const maxStatValue = results[0].max_stat_value;
          res.send(maxStatValue.toString());
        } else {
          console.log('No results found for the query');
          res.send('0');
        }
      }
    });
  } else {
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
          res.send('0');
        }
      }
    });
  }
});

// Autocomplete endpoint to fetch player name suggestions
app.get('/autocomplete', (req, res) => {
  const query = req.query.query;

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
