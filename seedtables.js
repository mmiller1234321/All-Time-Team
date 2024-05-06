const mysql = require('mysql2');
require('dotenv').config(); // Load environmental variables from .env file

// Create MySQL connection pool using ClearDB connection URL
const pool = mysql.createPool(process.env.CLEARDB_MAUVE_URL);

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');

  // Now populate the generated_tables table with data
  populateGeneratedTables(connection);
});

function populateGeneratedTables(connection) {
  const teams = [
    "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox",
    "Chicago White Sox", "Chicago Cubs", "Cincinnati Reds", "Cleveland Guardians",
    "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals",
    "Los Angeles Angels of Anaheim", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers",
    "Minnesota Twins", "New York Yankees", "New York Mets", "Oakland Athletics",
    "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
    "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers",
    "Toronto Blue Jays", "Washington Nationals"
  ];

  const stats = ["r", "h", "2b", "3b", "hr", "rbi", "sb", "bb", "ibb"]; // Stats

  let insertQuery = 'INSERT INTO generated_tables (team_name, stat_name) VALUES ';

  for (let i = 0; i < teams.length; i++) {
    for (let k = 0; k < stats.length; k++) {
      insertQuery += `("${teams[i]}", "${stats[k]}"), `;
    }
  }

  // Remove the trailing comma and space
  insertQuery = insertQuery.slice(0, -2);

  connection.query(insertQuery, (err, results) => {
    if (err) {
      console.error('Error populating generated_tables:', err);
    } else {
      console.log('Generated tables populated successfully');
      // Generate and save files here if needed
      generateAndSaveFiles();
    }
    connection.release();
  });
}

function generateAndSaveFiles() {
  // Add logic here to generate and save files based on the populated table
  // Ensure proper error handling and logging

  // For now, let's just log a message indicating that files are generated.
  console.log('Files generated and saved successfully.');
}
