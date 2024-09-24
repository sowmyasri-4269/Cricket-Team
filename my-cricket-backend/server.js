const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const validator = require('validator'); // Importing validator

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Not necessary if body-parser is used, but okay to keep

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost', // Use 'localhost' for local MySQL, change if using remote
  user: 'root', // Your MySQL username
  password: 'root', // Your MySQL password
  database: 'cricketDB' // Your MySQL database
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Submit-form route
app.post('/submit-form', (req, res) => {
  // Log incoming request data
  console.log('Received data:', req.body);

  const { name, email, teamName, players } = req.body; // Extract data from request body

  // Validate email format using validator
  if (!validator.isEmail(email)) {
    return res.status(400).send({ error: 'Invalid email format' });
  }

  // Validate the number of players (should be exactly 11)
  const playerArray = players.split(',').map(player => player.trim());
  if (playerArray.length !== 11) {
    return res.status(400).send({ error: 'A cricket team must have exactly 11 players.' });
  }

  // SQL query to insert form data into the database
  const sql = 'INSERT INTO players (name, email, teamName, players) VALUES (?, ?, ?, ?)';
  const values = [name, email, teamName, players]; // Use data from the request

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Failed to insert data:', err);
      return res.status(500).send({ error: 'Failed to save form data' });
    }
    // Optionally, you could also send the inserted ID back
    res.status(200).send({ message: 'Form data saved successfully!', id: result.insertId });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
