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

// Prevent caching for autocomplete route
app.use('/autocomplete', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, require('./routes/autocomplete'));

// Routes setup
app.use('/search', require('./routes/search'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/saveScore', require('./routes/saveScore'));

// Fetch all previous gameboards
app.get('/fetch-previous-gameboards', (req, res) => {
  pool.query('SELECT id, team_name, stat_name FROM gameboard ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching previous gameboards:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else {
      res.json(results);
    }
  });
});

// Fetch the high score for a specific gameboard
app.get('/fetch-high-score/:gameboardId', (req, res) => {
  const { gameboardId } = req.params;
  pool.query(
    'SELECT MAX(total_score) AS high_score FROM games WHERE gameboard_id = ?',
    [gameboardId],
    (error, results) => {
      if (error) {
        console.error('Error fetching high score:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
      }
      const highScore = results[0].high_score || 'N/A'; // Handle case where there might be no scores
      res.json({ high_score: highScore });
    }
  );
});

// Route to fetch a specific gameboard along with its high score
app.get('/gameboard/:id', (req, res) => {
  const gameboardId = req.params.id;
  pool.query('SELECT * FROM gameboard WHERE id = ?', [gameboardId], (error, results) => {
    if (error) {
      console.error('Error fetching gameboard:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else if (results.length > 0) {
      // Fetch the high score for the loaded gameboard
      pool.query(
        'SELECT MAX(total_score) AS high_score FROM games WHERE gameboard_id = ?',
        [gameboardId],
        (error, scoreResults) => {
          if (error) {
            console.error('Error fetching high score:', error);
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
          } else {
            const highScore = scoreResults[0].high_score || 'N/A';
            // Combine the gameboard data with the high score and send to client
            res.json({ gameboard: results[0], high_score: highScore });
          }
        }
      );
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
