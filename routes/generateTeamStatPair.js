const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 259200 }); // Cache expires after 72 hours
let lastFetchedIndex = 0; // Counter to keep track of the last fetched index
let milwaukeeRBIDone = false; // Flag to track if Milwaukee Brewers and RBI condition has been processed

// Function to fetch the next row from the database
function fetchNextRow() {
  // Fetch the next row from the database based on the last fetched index
  pool.query('SELECT * FROM generated_tables LIMIT ?, 1', [lastFetchedIndex], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        const totalScore = results[0].total_score;
        const teamStatPair = { team: teamName, stat: statName, totalScore: totalScore };
        
        // Insert the fetched data into the gameboard table
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get current date
        pool.query('INSERT INTO gameboard (team_name, stat_name, date) VALUES (?, ?, ?)', [teamName, statName, currentDate], (error, results) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
            // Continue even if there's an error inserting into gameboard table
          }
        });

        cache.set('teamStatPair', teamStatPair);
        lastFetchedIndex++; // Increment the last fetched index

        // Check if Milwaukee Brewers and RBI condition is met and it hasn't been processed before
        if (!milwaukeeRBIDone && teamName === "Milwaukee Brewers" && statName === "RBI") {
          // Set flag to true to indicate it has been processed
          milwaukeeRBIDone = true;
          // Start timer for 72 hours
          setTimeout(fetchNextRow, 72 * 60 * 60 * 1000);
        }
      } else {
        console.log('No more team and stat pairs found in the database');
      }
    }
  });
}

// Fetch the next row on server start
fetchNextRow();

// Route to handle fetching the team and stat pair
router.get('/', (req, res, next) => {
  const cachedData = cache.get('teamStatPair');
  if (cachedData) {
    res.json(cachedData);
  } else {
    res.status(404).send('No team and stat pairs found');
  }
});

module.exports = router;





