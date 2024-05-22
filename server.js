const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js');
const app = express();

require('dotenv').config();

// Middleware setup
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes setup
app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/search', require('./routes/search'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/saveScore', require('./routes/saveScore'));

// Fetch all previous gameboards
app.get('/fetch-previous-gameboards', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
      return;
    }

    connection.query('SELECT id, team_name, stat_name FROM gameboard ORDER BY id DESC', (error, results) => {
      connection.release();
      if (error) {
        console.error('Error fetching previous gameboards:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
      } else {
        res.json(results);
      }
    });
  });
});

// Fetch the high score for a specific gameboard
app.get('/fetch-high-score/:gameboardId', (req, res) => {
  const { gameboardId } = req.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
      return;
    }

    connection.query(
      'SELECT MAX(total_score) AS high_score FROM games WHERE gameboard_id = ?',
      [gameboardId],
      (error, results) => {
        connection.release();
        if (error) {
          console.error('Error fetching high score:', error);
          res.status(500).json({ error: 'Internal Server Error', message: error.message });
        } else if (results.length === 0 || results[0].high_score === null) {
          res.json({ high_score: 'N/A' });
        } else {
          res.json({ high_score: results[0].high_score });
        }
      }
    );
  });
});

// Route to fetch a specific gameboard along with its high score
app.get('/gameboard/:id', (req, res) => {
  const gameboardId = req.params.id;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
      return;
    }

    connection.query('SELECT * FROM gameboard WHERE id = ?', [gameboardId], (error, results) => {
      if (error) {
        connection.release();
        console.error('Error fetching gameboard:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
      } else if (results.length > 0) {
        connection.query(
          'SELECT MAX(total_score) AS high_score FROM games WHERE gameboard_id = ?',
          [gameboardId],
          (error, scoreResults) => {
            connection.release();
            if (error) {
              console.error('Error fetching high score:', error);
              res.status(500).json({ error: 'Internal Server Error', message: error.message });
            } else {
              res.json({ gameboard: results[0], high_score: scoreResults[0].high_score || 'N/A' });
            }
          }
        );
      } else {
        connection.release();
        res.status(404).send('Gameboard not found');
      }
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
