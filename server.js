const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/search', require('./routes/search'));
app.use('/autocomplete', require('./routes/autocomplete'));
app.use('/generateTeamStatPair', require('./routes/generateTeamStatPair'));
app.use('/save-score', require('./routes/saveScore'));

function fetchNextRow() {
  pool.query('SELECT team_name, stat_name FROM generated_tables LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        
        pool.query('INSERT INTO gameboard (team_name, stat_name) VALUES (?, ?)', [teamName, statName], (error, results) => {
          if (error) {
            console.error('Error inserting data into gameboard table:', error);
          }
        });

        setTimeout(fetchNextRow, 72 * 60 * 60 * 1000);
      } else {
        console.log('No team and stat pairs found in the database');
      }
    }
  });
}

fetchNextRow();

app.get('/fetch-gameboard', (req, res) => {
  pool.query('SELECT team_name, stat_name FROM gameboard LIMIT 1', (error, results) => {
    if (error) {
      console.error('Error fetching team and stat pair:', error);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length > 0) {
        const teamName = results[0].team_name;
        const statName = results[0].stat_name;
        res.json({ team: teamName, stat: statName });
      } else {
        console.log('No team and stat pairs found in the gameboard table');
        res.status(404).send('No team and stat pairs found');
      }
    }
  });
});

app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).send('Internal server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

