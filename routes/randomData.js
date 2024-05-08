// routes/randomData.js
const express = require('express');
const router = express.Router();

// Define teams and stats arrays
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

const stats = ["r", "h", "2b", "3b", "hr", "rbi", "sb", "bb", "ibb"]; // Add additional stats here

// Route to handle random team and stat generation
router.get('/', (req, res) => {
  // Generate random team and stat
  const randomTeam = teams[Math.floor(Math.random() * teams.length)];
  const randomStat = stats[Math.floor(Math.random() * stats.length)];

  // Send the random team and stat as JSON
  res.json({ team: randomTeam, stat: randomStat });
});

module.exports = router;
