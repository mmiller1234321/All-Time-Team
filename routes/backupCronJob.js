const cron = require('node-cron');
const pool = require('../db/db.js');

// Function to check and insert the next team-stat pair if needed
function checkAndInsertNextTeamStatPair() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error getting MySQL connection:`, err);
      return;
    }

    connection.query('SELECT COUNT(*) AS count FROM gameboard', (error, results) => {
      if (error) {
        console.error(`[${new Date().toISOString()}] Backup Cron Job: Error checking gameboard entries:`, error);
        connection.release();
        return;
      }

      const gameboardCount = results[0].count;

      if (gameboardCount === 0) {
        insertNextTeamStatPair(connection);
      } else {
        connection.release();
        console.log(`[${new Date().toISOString()}] Backup Cron Job: Gameboard already has entries.`);
      }
    });
  });
}

// Function to insert the next team-stat pair
function insertNextTeamStatPair(connection) {
  const query = `
    SELECT gt.team_name, gt.stat_name, gt.perfect_score, gt.id 
    FROM generated_tables AS gt
    WHERE NOT EXISTS (
      SELECT 1 FROM gameboard AS gb WHERE gt.team_name = gb.team_name AND gt.stat_name = gb.stat_name
    )
    ORDER BY gt.id ASC 
    LIMIT 1`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error executing MySQL query:`, error);
      connection.release();
      return;
    }

    if (results.length > 0) {
      const { team_name: teamName, stat_name: statName, perfect_score: perfectScore } = results[0];

      connection.query(
        'INSERT INTO gameboard (team_name, stat_name, perfect_score) VALUES (?, ?, ?)',
        [teamName, statName, perfectScore],
        (insertError) => {
          if (insertError) {
            console.error(`[${new Date().toISOString()}] Backup Cron Job: Error inserting data into gameboard:`, insertError);
          } else {
            console.log(`[${new Date().toISOString()}] Backup Cron Job: Inserted ${teamName} - ${statName} - ${perfectScore} into gameboard`);
          }
          connection.release();
        }
      );
    } else {
      console.log(`[${new Date().toISOString()}] Backup Cron Job: No new unique team-stat pair found.`);
      connection.release();
    }
  });
}

// Schedule the cron job to run every 10 minutes
cron.schedule('*/10 * * * *', () => {
  console.log(`[${new Date().toISOString()}] Running backup cron job to check and insert next team-stat pair if needed.`);
  checkAndInsertNextTeamStatPair();
});
