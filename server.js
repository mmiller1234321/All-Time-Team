require('dotenv').config(); // Load environmental variables from .env file

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // Import the path module

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

// Search endpoint to fetch player stats
app.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat;

  // Validate input parameters
  if (!playerName || !position || !team || !stat) {
    return res.status(400).send('Missing required parameters');
  }

  let query;
  let params;

  // Logic for team associations
  if (team === 'Los Angeles Angels of Anaheim') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'California Angels', 'Anaheim Angels'];
  } else if (team === 'Cleveland Indians' || team === 'Cleveland Guardians') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'Cleveland Indians'];
  } else if (team === 'Washington Nationals') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'Montreal Expos'];
  } else if (team === 'San Francisco Giants') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'New York Giants'];
  } else if (team === 'Los Angeles Dodgers') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'Brooklyn Dodgers'];
  } else if (team === 'Texas Rangers') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'Washington Senators'];
  } else if (team === 'Atlanta Braves') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'Milwaukee Braves'];
  } else if (team === 'Oakland Athletics' || team === 'Kansas City Athletics' || team === 'Philadelphia Athletics') {
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.team_name = ? OR t.team_name = ? OR t.team_name = ?)
    `;
    params = [playerName, position, team, 'Kansas City Athletics', 'Philadelphia Athletics'];
  } else {
    // Default logic for other teams
    query = `
      SELECT MAX(b.${stat}_name) AS max_stat_value
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND t.team_name = ?
    `;
    params = [playerName, position, team];
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      return res.status(500).send('Internal server error');
    } else {
      if (results.length > 0 && results[0].max_stat_value !== null) {
        const maxStatValue = results[0].max_stat_value;
        return res.send(maxStatValue.toString());
      } else {
        console.log('No results found for the query');
        return res.send('0');
      }
    }
  });
});

// Autocomplete endpoint to fetch player name suggestions
app.get('/autocomplete', (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).send('Missing query parameter');
  }

  const autocompleteQuery = `
    SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName
    FROM people
    WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
    LIMIT 10
  `;

  pool.query(autocompleteQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error('Error executing autocomplete MySQL query:', error);
      return res.status(500).send('Internal server error');
    } else {
      const suggestions = results.map((row) => row.fullName);
      return res.json(suggestions);
    }
  });
});

// Serve the static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Automatic team and stat update after 72 hours
const updateInterval = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

function updateTeamAndStat() {
  // Logic to update team and stat goes here
  console.log('Updating team and stat...');
}

updateTeamAndStat(); // Initial update

setInterval(updateTeamAndStat, updateInterval); // Schedule periodic updates

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});