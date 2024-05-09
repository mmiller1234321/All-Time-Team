const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Load environmental variables from .env file
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Add this line to parse JSON request bodies

// Routes
app.use('/search', require('./routes/search'));
app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));

// New route to handle saving total score
app.post('/save-score', (req, res) => {
  const { totalScore, team, stat } = req.body;
  // Here you can handle saving the total score to your database along with team and stat
  console.log('Received total score:', totalScore, 'for team:', team, 'and stat:', stat);
  // Example: Save the total score to the database
  // YourDatabaseModel.create({ total_score: totalScore, team: team, stat: stat });
  res.sendStatus(200); // Send a success response
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).send('Internal server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
