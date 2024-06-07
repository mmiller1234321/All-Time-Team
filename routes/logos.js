const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Database connection parameters
const DB_HOST = 'us-cluster-east-01.k8s.cleardb.net';
const DB_NAME = 'heroku_13750c9b55d1a3c';
const DB_USER = 'bf9367bf3dc2ed';
const DB_PASS = '0cc9f7ec';

// Create the database connection
const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
});

// Route to fetch a logo by team name
router.get('/logo/:teamName', (req, res) => {
    const teamName = req.params.teamName;
    connection.query('SELECT logo FROM team_logos WHERE team_name = ?', [teamName], (err, results) => {
        if (err) {
            res.status(500).send('Database query error');
            return;
        }
        if (results.length > 0) {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(results[0].logo);
        } else {
            res.status(404).send('Logo not found');
        }
    });
});

module.exports = router;

