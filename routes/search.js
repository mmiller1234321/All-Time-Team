const express = require('express');
const router = express.Router();
const pool = require('../db/db.js');

const getHighScore = (team_name, stat_name) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT MAX(total_score) as high_score 
            FROM games 
            WHERE team_name = ? AND stat_name = ?
        `;
        pool.query(query, [team_name, stat_name], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0].high_score || 0);
        });
    });
};

router.get('/', (req, res) => {
  const playerName = req.query.playerName;
  const position = req.query.position;
  const team = req.query.team;
  const stat = req.query.stat;

  let query;
  let params;

  if (team === 'Los Angeles Angels of Anaheim') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'California Angels', 'Anaheim Angels'];
  } else if (team === 'Cleveland Indians' || team === 'Cleveland Guardians') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'Cleveland Indians'];
  } else if (team === 'Washington Nationals') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'Montreal Expos'];
  } else if (team === 'San Francisco Giants') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'New York Giants'];
  } else if (team === 'Los Angeles Dodgers') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'Brooklyn Dodgers'];
  } else if (team === 'Texas Rangers') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'Washington Senators'];
  } else if (team === 'Atlanta Braves') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'Milwaukee Braves'];
  } else if (team === 'Oakland Athletics' || team === 'Kansas City Athletics' || team === 'Philadelphia Athletics') {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND (t.name = ? OR t.name = ? OR t.name = ?)
      GROUP BY b.playerID
    `;
    params = [playerName, position, team, 'Kansas City Athletics', 'Philadelphia Athletics'];
  } else {
    query = `
      SELECT MAX(b.${stat}) AS max_stat_value, b.playerID
      FROM batting AS b
      JOIN people AS p ON b.playerID = p.playerID
      JOIN fielding AS f ON b.playerID = f.playerID
      JOIN teams AS t ON b.teamID = t.teamID
      WHERE CONCAT(p.nameFirst, ' ', p.nameLast) = ? 
        AND f.POS = ?
        AND t.name = ?
      GROUP BY b.playerID
    `;
    params = [playerName, position, team];
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    connection.query(query, params, (error, results) => {
      connection.release();
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (results.length > 0 && results[0].max_stat_value !== null) {
          const maxStatValue = results[0].max_stat_value;
          const playerID = results[0].playerID;
          res.json({ maxStatValue: maxStatValue.toString(), playerID });
        } else {
          res.json({ maxStatValue: '0', playerID: null });
        }
      }
    });
  });
});

router.get('/getHighScore', async (req, res) => {
    const { team_name, stat_name } = req.query;

    try {
        const highScore = await getHighScore(team_name, stat_name);
        res.json({ highScore });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

module.exports = router;
