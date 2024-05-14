const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// Function to generate the next team and stat pair
async function generateNextTeamStatPair() {
  try {
    // Fetch the first row from the generated_tables table
    const [rows] = await pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1');
    if (rows.length > 0) {
      const teamName = rows[0].team_name;
      const statName = rows[0].stat_name;

      // Insert the fetched data into the gameboard table without the date
      await pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName]);

      console.log(`Inserted ${teamName} - ${statName} into gameboard`);

      // Start timer for 72 hours
      setTimeout(generateNextTeamStatPair, 72 * 60 * 60 * 1000);
    } else {
      console.log('No team and stat pairs found in the database');
    }
  } catch (error) {
    console.error('Error executing MySQL query:', error);
  }
}

// Generate the first team and stat pair on server start
generateNextTeamStatPair();

// Route to handle fetching the next team and stat pair
router.get('/team-stat-pair', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, team_name, stat_name FROM gameboard ORDER BY date ASC LIMIT 1');
    if (rows.length > 0) {
      const id = rows[0].id; // Changed from gameboardID to id
      const teamName = rows[0].team_name;
      const statName = rows[0].stat_name;
      res.json({ id: id, team: teamName, stat: statName }); // Adjusted response keys
    } else {
      console.log('No team and stat pairs found in the gameboard table');
      res.status(404).send('No team and stat pairs found');
    }
  } catch (error) {
    console.error('Error fetching team and stat pair:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;






















































