const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

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

// Folder containing the SVG files
const svgFolder = path.join(__dirname);

// Function to read SVG file
function readSvg(filePath) {
    return fs.readFileSync(filePath);
}

// Insert each SVG file into the database
fs.readdir(svgFolder, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        if (path.extname(file) === '.svg') {
            const teamName = path.basename(file, '.svg'); // Assuming file name is the team name
            const svgData = readSvg(path.join(svgFolder, file));

            connection.query(
                'INSERT INTO team_logos (team_name, logo) VALUES (?, ?)',
                [teamName, svgData],
                (err, results) => {
                    if (err) throw err;
                    console.log(`Inserted ${teamName} logo into the database.`);
                }
            );
        }
    });

    // Close the connection after all files are processed
    connection.end(err => {
        if (err) throw err;
        console.log('Database connection closed.');
    });
});
