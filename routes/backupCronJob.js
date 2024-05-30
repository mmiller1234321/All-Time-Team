const cron = require('node-cron');
const pool = require('../db/db.js');

// Function to insert the next team-stat pair
function insertNextTeamStatPair() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error getting MySQL connection:`, err);
      return;
    }

    acquireLock(connection, (lockAcquired) => {
      if (lockAcquired) {
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
            console.log(`[${new Date().toISOString()}] Backup Cron Job: No new unique team-stat pair found.`);
            releaseLock(connection);
            connection.release();
          }
        });
      } else {
        connection.release();
      }
    });
  });
}

// Function to acquire a lock
function acquireLock(connection, callback) {
  const lockName = 'team_stat_pair_insert';

  const query = `
    INSERT INTO process_locks (lock_name, locked) VALUES (?, TRUE)
    ON DUPLICATE KEY UPDATE locked = IF(locked = FALSE, TRUE, locked);
  `;

  connection.query(query, [lockName], (err, results) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error acquiring lock:`, err);
      return callback(false);
    }

    if (results.affectedRows === 1) {
      console.log(`[${new Date().toISOString()}] Backup Cron Job: Lock acquired successfully.`);
      return callback(true);
    } else {
      console.log(`[${new Date().toISOString()}] Backup Cron Job: Lock not acquired.`);
      return callback(false);
    }
  });
}

// Function to release the lock
function releaseLock(connection) {
  const lockName = 'team_stat_pair_insert';

  const query = `
    UPDATE process_locks SET locked = FALSE WHERE lock_name = ?;
  `;

  connection.query(query, [lockName], (err) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Backup Cron Job: Error releasing lock:`, err);
    } else {
      console.log(`[${new Date().toISOString()}] Backup Cron Job: Lock released successfully.`);
    }
  });
}

// Schedule the cron job to run every 10 minutes
cron.schedule('*/10 * * * *', () => {
  console.log(`[${new Date().toISOString()}] Running backup cron job to insert next team-stat pair.`);
  insertNextTeamStatPair();
});
