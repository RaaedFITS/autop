// db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // e.g., 'localhost'
  user: process.env.DB_USER,       // e.g., 'FITS'
  password: process.env.DB_PASSWORD, // e.g., 'your_mysql_password'
  database: process.env.DB_NAME,   // e.g., 'parabola_db'
  waitForConnections: true,
  connectionLimit: 10,             // Adjust based on your needs
  queueLimit: 0
});

module.exports = pool;
