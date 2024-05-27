const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db.js');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to block WordPress bot requests
app.use((req, res, next) => {
  const blockedPaths = [
    '/wp-includes/wlwmanifest.xml',
    '/administrator/index.php',
    '/view-source:',
    '/misc/ajax.js',
    '/xmlrpc.php',
    '/blog/wp-includes/wlwmanifest.xml',
    '/web/wp-includes/wlwmanifest.xml',
    '/wordpress/wp-includes/wlwmanifest.xml',
    '/website/wp-includes/wlwmanifest.xml',
    '/wp/wp-includes/wlwmanifest.xml',
    '/news/wp-includes/wlwmanifest.xml',
    '/2020/wp-includes/wlwmanifest.xml',
    '/2019/wp-includes/wlwmanifest.xml',
    '/shop/wp-includes/wlwmanifest.xml',
    '/wp1/wp-includes/wlwmanifest.xml',
    '/test/wp-includes/wlwmanifest.xml',
    '/media/wp-includes/wlwmanifest.xml',
    '/wp2/wp-includes/wlwmanifest.xml',
    '/site/wp-includes/wlwmanifest.xml',
    '/cms/wp-includes/wlwmanifest.xml',
    '/sito/wp-includes/wlwmanifest.xml'
  ];
  if (blockedPaths.includes(req.path)) {
    return res.status(404).send('Not Found');
  }
  next();
});

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

app.get('/search', (req, res) => {
  const { playerName, position, team, stat } = req.query;
  if (!playerName || !position || !team || !stat) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required query parameters' });
  }
  const query = `
    SELECT MAX(b.${stat}) AS max_stat_value
    FROM batting AS b
    JOIN people AS p ON b.playerID = p.playerID
    JOIN fielding AS f ON b.playerID = f.playerID
    JOIN teams AS t ON b.teamID = t.teamID
    WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
      AND f.POS = ? 
      AND t.name = ? 
  `;
  pool.query(query, [playerName, position, team], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results[0] ? results[0].max_stat_value : 'N/A');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
