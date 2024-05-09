const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { totalScore, teamName, statName } = req.body;

  // Save the total score, team name, and stat name to the database
  // Example: Insert into your database table with appropriate SQL query
  
  // Respond with success message
  res.status(200).json({ message: 'Total score saved successfully' });
});

module.exports = router;
