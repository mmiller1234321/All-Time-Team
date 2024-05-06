require('dotenv').config(); // Load environmental variables from .env file

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  connection.release();
});

// Error handling for the connection pool
pool.on('error', (err) => {
  console.error('MySQL connection pool error:', err);
  process.exit(1);
});

// Endpoint to retrieve team and stat labels from the database
app.get('/getLabels', (req, res) => {
  const currentTime = new Date();
  const seventyTwoHoursAgo = new Date(currentTime.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago

  pool.query('SELECT * FROM generated_tables WHERE last_used < ?', [seventyTwoHoursAgo], (error, results) => {
    if (error) {
      console.error('Error retrieving labels from the database:', error);
      res.status(500).send('Internal server error');
    } else {
      if (results.length > 0) {
        // Randomly select a pair of team and stat labels
        const randomIndex = Math.floor(Math.random() * results.length);
        const randomPair = results[randomIndex];
        
        // Update the timestamp for the selected pair
        pool.query('UPDATE generated_tables SET last_used = ? WHERE id = ?', [currentTime, randomPair.id], (updateError) => {
          if (updateError) {
            console.error('Error updating last_used timestamp:', updateError);
          }
        });

        // Send the selected pair of labels in the response
        res.json({ teamLabel: randomPair.team_name, statLabel: randomPair.stat_name });
      } else {
        // If no pairs found, send an empty response
        res.json({});
      }
    }
  });
});

// Endpoint to search for player stats
app.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat;

  let query;
  let params;

  // Build the SQL query based on team name
  if (team === 'Los Angeles Angels of Anaheim') {
    // Logic for Los Angeles Angels of Anaheim
    // Similar logic for other teams
  } else {
    // Default logic for other teams
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND t.name = ?
    `;
    params = [playerName, position, team];
  }

  // Execute the SQL query
  pool.query(query, params, (error, results) => {
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
});

// Endpoint for autocomplete suggestions
app.get('/autocomplete', (req, res) => {
  const query = req.query.query;

  const autocompleteQuery = `
    SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName
    FROM people
    WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
    LIMIT 10
  `;

  // Execute the autocomplete SQL query
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

// Serve static files
app.use(express.static('public'));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
