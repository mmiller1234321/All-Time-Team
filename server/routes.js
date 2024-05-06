const express = require('express');
const path = require('path');
const pool = require('./db'); // Import the database connection

const router = express.Router();

// Define route handler for the homepage
router.get('/', (req, res) => {
  // Handle logic for the homepage here
  res.send('Welcome to the homepage');
});

// Search endpoint to fetch player stats
router.get('/search', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat;

  let query;
  let params;

  // Logic for team associations
  if (team === 'Los Angeles Angels of Anaheim') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'California Angels', 'Anaheim Angels'];
  } else if (team === 'Cleveland Indians' || team === 'Cleveland Guardians') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'Cleveland Indians'];
  } else if (team === 'Washington Nationals') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'Montreal Expos'];
  } else if (team === 'San Francisco Giants') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'New York Giants'];
  } else if (team === 'Los Angeles Dodgers') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'Brooklyn Dodgers'];
  } else if (team === 'Texas Rangers') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'Washington Senators'];
  } else if (team === 'Atlanta Braves') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'Milwaukee Braves'];
  } else if (team === 'Oakland Athletics' || team === 'Kansas City Athletics' || team === 'Philadelphia Athletics') {
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND (t.name = ? OR t.name = ? OR t.name = ?)`;
    params = [playerName, position, team, 'Kansas City Athletics', 'Philadelphia Athletics'];
  } else {
    // Default logic for other teams
    query = `SELECT MAX(b.${stat}) AS max_stat_value
             FROM batting AS b
             JOIN people AS p ON b.playerID = p.playerID
             JOIN fielding AS f ON b.playerID = f.playerID
             JOIN teams AS t ON b.teamID = t.teamID
             WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
             AND f.POS = ?
             AND t.name = ?`;
    params = [playerName, position, team];
  }

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

// Autocomplete endpoint to fetch player name suggestions
router.get('/autocomplete', (req, res) => {
  const query = req.query.query;

  const autocompleteQuery = `SELECT CONCAT(nameFirst, ' ', nameLast) AS fullName
                             FROM people
                             WHERE CONCAT(nameFirst, ' ', nameLast) LIKE ?
                             LIMIT 10`;

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
