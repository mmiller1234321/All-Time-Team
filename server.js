const express = require('express');
const mysql = require('mysql');

const app = express();

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'your-database-host',
  user: 'your-database-user',
  password: 'your-database-password',
  database: 'your-database-name'
});

// Connect to MySQL
connection.connect();

// API endpoint to handle the search request
app.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;

  // MySQL query to find the highest number of home runs for the given player, position, and team
  const query = `
    SELECT MAX(b.HR) AS max_home_runs
    FROM batting AS b
    JOIN people AS p ON b.playerID = p.playerID
    JOIN fielding AS f ON b.playerID = f.playerID
    JOIN teams AS t ON b.teamID = t.teamID
    WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
      AND f.POS = ?
      AND t.name = ?
  `;

  connection.query(query, [playerName, position, team], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).send('Internal server error');
    } else {
      const maxHomeRuns = results[0].max_home_runs;
      res.send(maxHomeRuns.toString());
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
