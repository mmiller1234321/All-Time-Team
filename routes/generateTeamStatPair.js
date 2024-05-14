const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');  // Ensure this is the promise pool from 'mysql2/promise'

// Function to generate the next team and stat pair
async function generateNextTeamStatPair() {
    try {
        const [results] = await pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1');
        if (results.length > 0) {
            const { team_name: teamName, stat_name: statName } = results[0];
            await pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName]);
            setTimeout(generateNextTeamStatPair, 72 * 60 * 60 * 1000); // Set to fetch the next row every 72 hours
        } else {
            console.log('No team and stat pairs found in the database');
        }
    } catch (error) {
        console.error('Error in generateNextTeamStatPair function:', error);
    }
}

// Generate the first team and stat pair on server start
generateNextTeamStatPair();

// Route to handle fetching the next team and stat pair
router.get('/team-stat-pair', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT id, team_name, stat_name FROM gameboard ORDER BY date ASC LIMIT 1');
        if (results.length > 0) {
            const { id, team_name: teamName, stat_name: statName } = results[0];
            res.json({ id, team: teamName, stat: statName });
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


























