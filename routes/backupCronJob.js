const cron = require('node-cron');
const pool = require('../db/db.js');

// Function to release the lock
function releaseLock(connection) {
  connection.query(
    'UPDATE process_locks SET locked = FALSE WHERE lock_name = "team_stat_pair"',
    (error) => {
      if (error) {
        console.error(`[${new Date().toISOString()}] Error releasing lock:`, error);
      } else {
        console.log(`[${new Date().toISOString()}] Lock released.`);
      }
    }
  );
}

// Function to insert the next team-stat pair
function insertNextTeamStatPair() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error getting MySQL connection:`, err);
      return;
    }

    connection.query('SELECT locked FROM process_locks WHERE lock_name = "team_stat_pair"', (lockError, lockResults) => {
      if (lockError) {
        console.error(`[${new Date().toISOString()}] Backup Cron Job: Error checking lock:`, lockError);
        connection.release();
        return;
      }

      if (lockResults.length === 0 || lockResults[0].locked) {
        console.log(`[${new Date().toISOString()}] Backup Cron Job: Process is locked, skipping this cycle.`);
        connection.release();
        return;
      }

      connection.query('UPDATE process_locks SET locked = TRUE WHERE lock_name = "team_stat_pair"', (updateError) => {
        if (updateError) {
          console.error(`[${new Date().toISOString()}] Backup Cron Job: Error setting lock:`, updateError);
          connection.release();
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
            releaseLock(connection);
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
                releaseLock(connection);
                connection.release();
              }
            );
          } else {
            console.log(`[${new Date().toISOString()}] Backup Cron Job: No new unique team-stat pair found, waiting to retry...`);
            releaseLock(connection);
            connection.release();
          }
        });
      });
    });
  });
}

// Schedule the cron job to run every 10 minutes
cron.schedule('*/10 * * * *', () => {
  console.log(`[${new Date().toISOString()}] Running backup cron job to insert next team-stat pair.`);
  insertNextTeamStatPair();
});

// Initial execution on server start
insertNextTeamStatPair();

