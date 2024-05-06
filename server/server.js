require('dotenv').config(); // Load environmental variables from .env file
const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // Import the route handling file
const path = require('path'); // Import the path module

const app = express();
app.use(cors());

// Serve the static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the routes defined in the routes file
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
