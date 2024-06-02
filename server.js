const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js');
const app = express();

require('dotenv').config();

const corsOptions = {
  origin: ['https://alltimeteam.net', 'https://www.alltimeteam.net'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/search', require('./routes/search'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/saveScore', require('./routes/saveScore'));
app.use('/gameboard', require('./routes/gameboards'));

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

app.get('/fetch-high-score', (req, res) => {
  const { team, stat } = req.query;
  pool.query(
    'SELECT MAX(total_score) AS high_score FROM games WHERE team_name = ? AND stat_name = ?',
    [team, stat],
    (error, results) => {
      if (error) {
        console.error('Error fetching high score:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
      }
      if (results.length === 0 || results[0].high_score === null) {
        res.json({ high_score: 'N/A' });
      } else {
        res.json({ high_score: results[0].high_score });
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Import and start the backup cron job
const { insertNextTeamStatPair } = require('./routes/backupCronJob');
insertNextTeamStatPair();

