const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js'); // Ensure this is the callback pool from 'mysql2'
const app = express();

require('dotenv').config();

// Middleware setup
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes setup
app.use('/search', require('./routes/search'));
app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/saveScore', require('./routes/saveScore'));

// Fetch all previous gameboards
app.get('/fetch-previous-gameboards', (req, res) => {
  pool.query('SELECT id, team_name, stat_name FROM gameboards ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching previous gameboards:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else {
      res.json(results);
    }
  });
});

// Route to fetch a specific gameboard
app.get('/gameboard/:id', (req, res) => {
  const gameboardId = req.params.id;
  pool.query('SELECT * FROM gameboards WHERE id = ?', [gameboardId], (error, results) => {
    if (error) {
      console.error('Error fetching gameboard:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Gameboard not found');
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
