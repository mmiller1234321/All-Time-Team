const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

// Function to fetch the next row from the database
function fetchNextRow() {
  // Fetch the first row from the generated_tables table
  pool.query('SELECT team_name, stat_name FROM generated_tables ORDER BY date ASC LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        
        // Insert the fetched data into the gameboard table
        pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName], (error, results) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
            // Continue even if there's an error inserting into gameboard table
          }
        });

        // Start timer for 72 hours
        setTimeout(fetchNextRow, 72 * 60 * 60 * 1000);
      } else {
        console.log('No team and stat pairs found in the database');
      }
    }
  });
}

// Function to fetch the next row from the database
function fetchNextRow() {
  // Fetch the first row from the generated_tables table
  pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        
        // Insert the fetched data into the gameboard table
        pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName], (error, results) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
            // Continue even if there's an error inserting into gameboard table
          }
        });

        // Start timer for 72 hours
        setTimeout(fetchNextRow, 72 * 60 * 60 * 1000);
      } else {
        console.log('No team and stat pairs found in the database');
      }
    }
  });
}


module.exports = router;







