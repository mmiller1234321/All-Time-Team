// scripts/runCronJob.js
const pool = require('../db/db.js');

// Function to insert the next team-stat pair
function insertNextTeamStatPair() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error getting MySQL connection:`, err);
      return;
    }

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
        console.log(`[${new Date().toISOString()}] Backup Cron Job: No new unique team-stat pair found, waiting to retry...`);
        connection.release();
      }
    });
  });
}

// Run the function
insertNextTeamStatPair();
